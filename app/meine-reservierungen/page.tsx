"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, LogIn, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getDiscordSession } from "@/lib/discord-session"
import { getUserReservations, type Reservation } from "@/lib/user-data"

export default function MeineReservierungenPage() {
  const [discordUser, setDiscordUser] = useState<{ id: string; username: string; avatar: string } | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [expandedReservations, setExpandedReservations] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // Small delay to ensure cookies are available after redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const session = getDiscordSession()
      if (!session) {
        setIsLoading(false)
        return
      }

      setDiscordUser(session)
      const userReservations = await getUserReservations(session.id)
      setReservations(userReservations)
      setIsLoading(false)
    }

    loadData()
  }, [])

  if (!discordUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card border-border">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#5865F2]/10 flex items-center justify-center mx-auto">
              <LogIn className="h-10 w-10 text-[#5865F2]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Anmeldung erforderlich</h2>
              <p className="text-muted-foreground">
                Melden Sie sich mit Discord an, um Ihre Reservierungen zu sehen.
              </p>
            </div>
            <Button
              onClick={() => {
                window.location.href = "/api/auth/discord?returnTo=/meine-reservierungen"
              }}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-6 text-lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Mit Discord anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Wird geladen...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/profile" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6">
          <ArrowLeft className="h-5 w-5" />
          Zurück zum Profil
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Meine Reservierungen</h1>
          <p className="text-muted-foreground">Alle deine Reservierungen in der Übersicht</p>
        </div>

        {reservations.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">Du hast noch keine Reservierungen.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {reservations.map((r) => (
              <Collapsible key={r.id} open={expandedReservations.has(r.id)} onOpenChange={(open) => {
                const newSet = new Set(expandedReservations)
                if (open) newSet.add(r.id)
                else newSet.delete(r.id)
                setExpandedReservations(newSet)
              }}>
                <CollapsibleTrigger className="w-full p-4 bg-card rounded-lg hover:bg-card/80 transition flex items-center justify-between text-left">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground space-x-4">
                      <span><strong>Reservierungnr.</strong> {r.id}</span>
                      <span>Eingegangen: {r.date}</span>
                      <span>Personen: {r.guests}</span>
                    </div>
                  </div>
                  {expandedReservations.has(r.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 bg-card rounded-b-lg border-x border-b border-border">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <p><strong>Reservierungsnummer:</strong> {r.id}</p>
                    <p><strong>Datum:</strong> {r.date}</p>
                    <p><strong>Uhrzeit:</strong> {r.time}</p>
                    <p><strong>Personen:</strong> {r.guests}</p>
                    <p><strong>Status:</strong> {r.status}</p>
                    {r.notes && <p className="col-span-2"><strong>Notizen:</strong> {r.notes}</p>}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}

        {/* Navigation zu anderen Seiten */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Weitere Übersichten</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/meine-bestellungen">
              <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-card hover:bg-card/80 text-foreground rounded-lg transition border-border">
                <span className="text-2xl">🛍️</span>
                <span className="font-semibold">Meine Bestellungen</span>
              </Button>
            </Link>
            <Link href="/meine-werkstattbuchungen">
              <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-card hover:bg-card/80 text-foreground rounded-lg transition border-border">
                <span className="text-2xl">🔧</span>
                <span className="font-semibold">Meine Werkstattbuchungen</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
