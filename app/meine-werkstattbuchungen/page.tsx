"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, LogIn, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getDiscordSession } from "@/lib/discord-session"
import { getUserWerkstattOrders, type WerkstattOrder } from "@/lib/user-data"

export default function MeineWerkstattbuchungenPage() {
  const [discordUser, setDiscordUser] = useState<{ id: string; username: string; avatar: string } | null>(null)
  const [werkstattOrders, setWerkstattOrders] = useState<WerkstattOrder[]>([])
  const [expandedWerkstatt, setExpandedWerkstatt] = useState<Set<number>>(new Set())
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
      const userWerkstattOrders = await getUserWerkstattOrders(session.id)
      setWerkstattOrders(userWerkstattOrders)
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
                Melden Sie sich mit Discord an, um Ihre Werkstattbuchungen zu sehen.
              </p>
            </div>
            <Button
              onClick={() => {
                window.location.href = "/api/auth/discord?returnTo=/meine-werkstattbuchungen"
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Meine Werkstattbuchungen</h1>
          <p className="text-muted-foreground">Alle deine Werkstattbuchungen in der Übersicht</p>
        </div>

        {werkstattOrders.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">Du hast noch keine Werkstattbuchungen.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {werkstattOrders.map((w) => (
              <Collapsible key={w.id} open={expandedWerkstatt.has(w.id)} onOpenChange={(open) => {
                const newSet = new Set(expandedWerkstatt)
                if (open) newSet.add(w.id)
                else newSet.delete(w.id)
                setExpandedWerkstatt(newSet)
              }}>
                <CollapsibleTrigger className="w-full p-4 bg-card rounded-lg hover:bg-card/80 transition flex items-center justify-between text-left">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground space-x-4">
                      <span><strong>Buchung #{w.id}</strong></span>
                      <span>Eingegangen: {new Date(w.created_at || "").toLocaleDateString()}</span>
                      <span>Gesamt: €{w.total.toFixed(2)}</span>
                    </div>
                  </div>
                  {expandedWerkstatt.has(w.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 bg-card rounded-b-lg border-x border-b border-border">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{w.customer_name}</h3>
                      <Badge variant={w.status === "Zubereitet" ? "default" : "secondary"}>
                        {w.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                      <p><strong>Buchungsnummer:</strong> {w.id}</p>
                      <p><strong>Telefon:</strong> {w.customer_phone}</p>
                      <p><strong>Notizen:</strong> {w.notes || "-"}</p>
                      <p><strong>Gesamt:</strong> €{w.total.toFixed(2)}</p>
                      <p><strong>Eingegangen:</strong> {new Date(w.created_at || "").toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-foreground">Bestellte Services:</h4>
                    <div className="space-y-1">
                      {w.items && w.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm text-muted-foreground">
                          <span>• {item.quantity}x {item.name}</span>
                          <span>€{(Number.parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
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
            <Link href="/meine-reservierungen">
              <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-card hover:bg-card/80 text-foreground rounded-lg transition border-border">
                <span className="text-2xl">📅</span>
                <span className="font-semibold">Meine Reservierungen</span>
              </Button>
            </Link>
            <Link href="/meine-bestellungen">
              <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-card hover:bg-card/80 text-foreground rounded-lg transition border-border">
                <span className="text-2xl">🛍️</span>
                <span className="font-semibold">Meine Bestellungen</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
