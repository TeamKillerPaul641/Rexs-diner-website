"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plane, CheckCircle } from "lucide-react"
import { getDiscordSession } from "@/lib/discord-session"

export default function UrlaubBeantragenPage() {
  const [discordUser, setDiscordUser] = useState<{ id: string; username: string; avatar: string } | null>(null)
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Discord Session aus Cookies laden
  useEffect(() => {
    const loadSession = async () => {
      // Small delay to ensure cookies are available after redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const session = getDiscordSession()
      if (session) {
        setDiscordUser(session)
      }
    }
    loadSession()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!discordUser) {
      setError("Du musst eingeloggt sein, um Urlaub zu beantragen.")
      return
    }

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError("Bitte fülle alle Felder aus.")
      return
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Das Startdatum darf nicht nach dem Enddatum liegen.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/urlaub", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: discordUser.id,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
        }),
      })

      if (!response.ok) {
        throw new Error("Fehler beim Speichern des Urlaubsantrags.")
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!discordUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Plane className="h-6 w-6" />
              Urlaub beantragen
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Du musst dich mit Discord einloggen, um Urlaub zu beantragen.
            </p>
            <Button asChild>
              <a href="/api/auth/discord?returnTo=/urlaub-beantragen">Mit Discord einloggen</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Urlaubsantrag eingereicht
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Dein Urlaubsantrag wurde erfolgreich eingereicht und wird von der Verwaltung geprüft.
            </p>
            <Button asChild>
              <a href="/">Zurück zur Startseite</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-6 w-6" />
              Urlaub beantragen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Startdatum</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Enddatum</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Grund für den Urlaub</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Bitte gib den Grund für deinen Urlaubsantrag an..."
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Wird eingereicht..." : "Urlaub beantragen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}