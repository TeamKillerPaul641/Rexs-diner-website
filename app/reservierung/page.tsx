"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, LogIn, CheckCircle } from "lucide-react"
import { saveReservation, getUserProfile, saveUserProfile, type UserProfile } from "@/lib/user-data"
import { getDiscordSession } from "@/lib/discord-session"

export default function ReservierungPage() {
  const searchParams = useSearchParams()
  const [discordUser, setDiscordUser] = useState<{ id: string; username: string; avatar: string } | null>(null)
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: "",
    name: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null)
  const [showSaveProfileDialog, setShowSaveProfileDialog] = useState(false)
  const [pendingReservation, setPendingReservation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Handle error from URL params
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      let errorMessage = "Ein unbekannter Fehler ist aufgetreten."
      switch (errorParam) {
        case "no_code":
          errorMessage = "OAuth-Code fehlt. Bitte versuchen Sie es erneut."
          break
        case "token_failed":
          errorMessage = "Fehler beim Abrufen des Tokens von Discord."
          break
        case "user_failed":
          errorMessage = "Fehler beim Abrufen der Benutzerdaten von Discord."
          break
        case "db_error":
          errorMessage = "Datenbankfehler. Bitte versuchen Sie es später erneut."
          break
        case "not_configured":
          errorMessage = "Discord ist nicht konfiguriert. Bitte wenden Sie sich an den Administrator."
          break
        case "invalid_config":
          errorMessage = "Ungültige Discord-Konfiguration."
          break
        case "server_error":
          errorMessage = "Serverfehler. Bitte versuchen Sie es später erneut."
          break
      }
      setError(errorMessage)
    }
  }, [searchParams])

  // Discord Session aus Cookies laden
  useEffect(() => {
    const loadSessionAndProfile = async () => {
      // Small delay to ensure cookies are available after redirect
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const session = getDiscordSession()
      if (session) {
        setDiscordUser(session)
        
        // Load user profile
        const profile = await getUserProfile(session.id)
        if (profile) {
          setOriginalProfile(profile)
          setFormData((prev) => ({
            ...prev,
            email: session.id,
            name: profile.full_name,
            phone: profile.phone,
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            email: session.id,
            name: session.username || prev.name,
          }))
        }
      }
    }
    loadSessionAndProfile()
  }, [])

  // Wenn nicht eingeloggt, Login-Screen anzeigen
  if (!discordUser) {
    if (error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 bg-card border-border">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground mb-2">Fehler bei der Anmeldung</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button
                onClick={() => {
                  window.location.href = "/api/auth/discord?returnTo=/reservierung"
                }}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-6 text-lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Erneut versuchen
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 bg-card border-border">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#5865F2]/10 flex items-center justify-center mx-auto">
              <LogIn className="h-10 w-10 text-[#5865F2]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Discord Anmeldung erforderlich</h2>
              <p className="text-muted-foreground">
                Um bei Rex Diner reservieren zu können, melden Sie sich bitte mit Ihrem Discord-Account an.
              </p>
            </div>
            <Button
              onClick={() => {
                window.location.href = "/api/auth/discord?returnTo=/reservierung"
              }}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-6 text-lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Mit Discord anmelden
            </Button>
            <p className="text-xs text-muted-foreground">
              Ihre Discord-ID wird automatisch verwendet, um Reservierungsbenachrichtigungen zu senden.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sendDiscordNotification = async (reservationData: any) => {
    try {
      await fetch("/api/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "new_reservation",
          data: reservationData,
        }),
      })
    } catch (error) {
      console.error("Failed to send Discord notification:", error)
    }
  }

  const sendUserConfirmationDM = async (discordId: string) => {
    try {
      await fetch("/api/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "reservation_confirmation_dm",
          data: {
            discordUserId: discordId, // Verwende direkt die Discord ID
          },
        }),
      })
    } catch (error) {
      console.error("Failed to send confirmation DM:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const selectedDate = new Date(formData.date)
    const currentDate = new Date()

    // Setze die Uhrzeit des aktuellen Datums auf 00:00, um nur das Datum zu vergleichen
    currentDate.setHours(0, 0, 0, 0)

    // Berechne den Unterschied in Stunden zwischen dem aktuellen Datum und dem ausgewählten Datum
    const timeDiff = (selectedDate.getTime() - currentDate.getTime()) / (1000 * 3600)

    // Wenn das Datum weniger als 24 Stunden in der Zukunft liegt, zeige eine Fehlermeldung an
    if (timeDiff < 24) {
      setError("Sie können nur einen Tisch für mindestens 24 Stunden im Voraus reservieren.")
      return
    }

    // Leere Fehlermeldung, wenn alles in Ordnung ist
    setError(null)

    const reservation = {
      name: formData.name,
      date: formData.date,
      time: formData.time,
      guests: Number.parseInt(formData.guests),
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
      status: "Neu",
    }

    // Check if profile data has changed
    const hasChanges =
      formData.name !== originalProfile?.full_name ||
      formData.phone !== originalProfile?.phone

    if (hasChanges) {
      setPendingReservation(reservation)
      setShowSaveProfileDialog(true)
    } else {
      await submitReservation(reservation)
    }
  }

  const submitReservation = async (reservation: any) => {
    // Reservierung in Supabase speichern
    const savedReservation = await saveReservation(reservation)
    
    if (!savedReservation) {
      alert("Fehler beim Speichern der Reservierung. Bitte versuchen Sie es erneut.")
      return
    }

    await sendDiscordNotification({ ...reservation, id: savedReservation.id })
    await sendUserConfirmationDM(formData.email)

    alert("Reservierung erfolgreich eingereicht!")

    // Formular zurücksetzen
    setFormData({
      date: "",
      time: "",
      guests: "",
      name: "",
      phone: "",
      email: "",
      notes: "",
    })
  }

  const saveProfileAndSubmitReservation = async () => {
    if (!discordUser || !pendingReservation) return

    try {
      // Save the profile
      await saveUserProfile({
        discord_id: discordUser.id,
        discord_username: discordUser.username,
        full_name: formData.name,
        phone: formData.phone,
        avatar_url: discordUser.avatar,
      })

      // Update original profile
      setOriginalProfile({
        discord_id: discordUser.id,
        discord_username: discordUser.username,
        full_name: formData.name,
        phone: formData.phone,
        avatar_url: discordUser.avatar,
      })

      setShowSaveProfileDialog(false)
      await submitReservation(pendingReservation)
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Fehler beim Speichern des Profils")
    }
  }

  const submitReservationWithoutSaving = async () => {
    setShowSaveProfileDialog(false)
    if (pendingReservation) {
      await submitReservation(pendingReservation)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Tisch reservieren</h1>
          <p className="text-xl text-muted-foreground">Reservieren Sie Ihren Tisch bei Rex Diner</p>
        </div>

        <Card className="max-w-2xl mx-auto bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              Reservierungsdetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Uhrzeit</Label>
                  <Input
                    type="time"
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <div className="space-y-2">
                <Label htmlFor="guests">Anzahl Personen</Label>
                <Input
                  type="number"
                  id="guests"
                  placeholder="2"
                  min="1"
                  max="12"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="Ihr vollständiger Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefonnummer</Label>
                <Input
                  type="tel"
                  id="phone"
                  placeholder="+49 123 456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Angemeldet als</Label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30">
                  {discordUser.avatar ? (
                    <img
                      src={discordUser.avatar}
                      alt={discordUser.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold">
                      {discordUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{discordUser.username}</p>
                    <p className="text-xs text-muted-foreground">ID: {discordUser.id}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>

              {/* Bestellnummer Eingabefeld */}
              {/*<div className="space-y-2">
                <Label htmlFor="orderNumber">Bestellnummer (optional)</Label>
                <Input
                  type="text"
                  id="orderNumber"
                  placeholder="Geben Sie Ihre Bestellnummer ein"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">Falls es sich um eine größere Bestellung handelt, geben Sie hier die Bestellnummer ein.</p>
              </div>*/}

              <div className="space-y-2">
                <Label htmlFor="notes">Besondere Wünsche (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Allergien, besondere Anlässe, Tischpräferenzen..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground py-3 text-lg font-semibold"
              >
                Reservierung bestätigen
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {showSaveProfileDialog && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Profil aktualisieren?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Du hast deine Reservierungsdaten geändert. Möchtest du diese in deinem Profil speichern?
              </p>
              <div className="space-y-2">
                {formData.name !== originalProfile?.full_name && (
                  <div className="text-sm">
                    <span className="font-medium text-foreground">Name: </span>
                    <span className="text-muted-foreground">{formData.name}</span>
                  </div>
                )}
                {formData.phone !== originalProfile?.phone && (
                  <div className="text-sm">
                    <span className="font-medium text-foreground">Telefon: </span>
                    <span className="text-muted-foreground">{formData.phone}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Diese Daten werden dann automatisch bei zukünftigen Reservierungen verwendet.
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={saveProfileAndSubmitReservation}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Speichern & Reservieren
                </Button>
                <Button
                  onClick={submitReservationWithoutSaving}
                  variant="outline"
                  className="flex-1"
                >
                  Nur reservieren
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
