"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, CheckCircle, AlertCircle } from "lucide-react"
import { getDiscordSession } from "@/lib/discord-session"

export default function RegistrierenPage() {
  const [discordUser, setDiscordUser] = useState<{ id: string; username: string; avatar: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    arbeitsplatz: "",
    akzeptiert: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Discord Session laden
  useEffect(() => {
    const session = getDiscordSession()
    if (session) {
      setDiscordUser(session)
    } else {
      // Wenn nicht eingeloggt, zur Discord-Auth weiterleiten
      window.location.href = "/api/auth/discord?returnTo=/registrieren"
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      akzeptiert: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!discordUser) {
      setError("Du musst mit Discord eingeloggt sein.")
      return
    }

    if (!formData.name.trim() || !formData.arbeitsplatz.trim()) {
      setError("Bitte fülle alle Felder aus.")
      return
    }

    if (!formData.akzeptiert) {
      setError("Du musst die Hausregeln akzeptieren.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/registrieren", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discordId: discordUser.id,
          name: formData.name.trim(),
          arbeitsplatz: formData.arbeitsplatz.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler bei der Registrierung.")
      }

      setSuccess(true)
      // Nach erfolgreicher Registrierung zur Login-Seite weiterleiten
      setTimeout(() => {
        router.push("/login")
      }, 2000)
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
              <UserPlus className="h-6 w-6" />
              Registrierung
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Lade...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Registrierung erfolgreich
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Deine Registrierung wurde erfolgreich abgeschlossen. Dein Discord-Nickname wurde aktualisiert.
            </p>
            <p className="text-sm text-muted-foreground">
              Du wirst zur Login-Seite weitergeleitet...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
              <img
                src="/images/rex-dinner-logo.png"
                alt="Rex Diner Logo"
                className="h-16 w-auto object-contain"
              />
              <img
                src="/images/rex-dinner-logo.png"
                alt="Rex Diner Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <CardTitle className="text-2xl">Willkommen bei Rex's Diner!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                Wir freuen uns, dich bei uns begrüßen zu dürfen. Damit sich alle Gäste rundum wohlfühlen, bitten wir dich, unsere Hausregeln zu beachten:
              </p>

              <h3>Waffenverbot</h3>
              <p>
                Zum Schutz aller Gäste und Mitarbeitenden ist das Mitführen von Waffen auf dem gesamten Gelände des Diners strengstens untersagt. Wir sind eine waffenfreie Zone und möchten ein sicheres, entspanntes Umfeld für alle schaffen.
              </p>

              <h3>Respektvolles Miteinander</h3>
              <p>
                Ein respektvolles und freundliches Verhalten ist uns sehr wichtig. Bitte behandle andere Gäste sowie unser Team mit Höflichkeit und Respekt. Belästigungen oder aggressive Verhaltensweisen werden nicht toleriert.
              </p>

              <h3>Haustiere</h3>
              <p>
                Aus hygienischen Gründen sind Haustiere im Diner leider nicht erlaubt – außer es handelt sich um assistierende Tiere (z.B. Blindenhunde). Vielen Dank für dein Verständnis!
              </p>

              <h3>Ruhe und Ordnung</h3>
              <p>
                Um eine angenehme Atmosphäre zu gewährleisten, bitten wir darum, laute Gespräche und den Gebrauch von Musikanlagen zu vermeiden. Lärmintensive Aktivitäten sollen die Wohlfühlatmosphäre nicht stören.
              </p>

              <h3>Sauberkeit</h3>
              <p>
                Bitte achte darauf, deinen Platz in einem ordentlichen Zustand zu hinterlassen. Unsere Mitarbeitenden stehen dir gerne zur Seite, um den Tisch zu reinigen – aber wir bitten dich, deinen Bereich sauber zu halten.
              </p>

              <h3>Angemessene Kleidung</h3>
              <p>
                Für das Wohl aller Gäste bitten wir dich, angemessene Kleidung zu tragen. Bekleidung, die unangemessen oder beleidigend ist, wird nicht gestattet.
              </p>

              <h3>Reservierungen</h3>
              <p>
                Für größere Gruppen oder besondere Anlässe empfehlen wir, im Voraus zu reservieren, um lange Wartezeiten zu vermeiden und dir einen stressfreien Besuch zu ermöglichen.
              </p>

              <h3>Zahlungsmethoden</h3>
              <p>
                Wir akzeptieren ausschließlich Zahlungen per Kreditkarte. Leider können wir keine Bargeldzahlungen annehmen.
              </p>

              <h3>Verhalten bei Notfällen</h3>
              <p>
                Im Falle eines Notfalls oder einer Evakuierung bitten wir dich, ruhig zu bleiben und den Anweisungen unseres Personals zu folgen. Deine Sicherheit hat für uns oberste Priorität.
              </p>

              <p>
                Wir danken dir herzlich für dein Verständnis und wünschen dir einen angenehmen Aufenthalt im Rex's Diner. Dein Wohlbefinden ist uns wichtig – lass uns gemeinsam dafür sorgen, dass dein Besuch unvergesslich wird!
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Registrierung als Mitarbeiter</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Vollständiger Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="z.B. Manfred Wolf"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arbeitsplatz">Arbeitsplatz</Label>
                    <Input
                      id="arbeitsplatz"
                      name="arbeitsplatz"
                      type="text"
                      value={formData.arbeitsplatz}
                      onChange={handleInputChange}
                      placeholder="z.B. Kellner, Koch, Manager"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="akzeptiert"
                    checked={formData.akzeptiert}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="akzeptiert" className="text-sm">
                    Ich habe die Hausregeln gelesen und akzeptiere sie.
                  </Label>
                </div>
                {error && (
                  <div className="text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Registriere..." : "Registrieren"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}