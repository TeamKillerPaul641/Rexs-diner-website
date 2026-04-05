"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ShoppingBag, Utensils, Clock, MapPin, Mail } from "lucide-react"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [openingHours, setOpeningHours] = useState({
    "Mo-Do": "17:00 - 23:00",
    "Fr-Sa": "17:00 - 24:00",
    So: "12:00 - 22:00",
  })

  const [contactInfo, setContactInfo] = useState({
    phone: "+49 (0) 123 456789",
    address: "Senora Way",
    city: "3056 Teamhausen",
    discord: "https://discord.gg/v42GuchGEr",
  })

  useEffect(() => {
    const savedConfig = localStorage.getItem("websiteConfig")
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        if (config.openingHours) {
          setOpeningHours(config.openingHours)
        }
        if (config.websiteSettings) {
          setContactInfo({
            phone: config.websiteSettings.contactPhone || "+49 (0) 123 456789",
            address: config.websiteSettings.contactAddress || "Senora Way",
            city: config.websiteSettings.contactCity || "3056 Teamhausen",
            discord: config.websiteSettings.contactDiscord || "https://discord.gg/v42GuchGEr",
          })
        }
      } catch (error) {
        console.error("Error loading website config:", error)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">Willkommen bei Rex´s Diner</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Erleben Sie authentische deutsche Küche in gemütlicher Atmosphäre. Frische Zutaten, traditionelle Rezepte
            und herzlicher Service erwarten Sie.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow bg-card border-border">
            <CardContent className="pt-6">
              <Utensils className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Frische Küche</h3>
              <p className="text-muted-foreground">
                Täglich frisch zubereitete Gerichte mit den besten regionalen Zutaten und traditionellen deutschen
                Rezepten.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow bg-card border-border">
            <CardContent className="pt-6">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Schneller Service</h3>
              <p className="text-muted-foreground">
                Professioneller und aufmerksamer Service, damit Sie Ihr Essen in entspannter Atmosphäre genießen können.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow bg-card border-border">
            <CardContent className="pt-6">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Einfache Reservierung</h3>
              <p className="text-muted-foreground">
                Reservieren Sie Ihren Tisch bequem online oder telefonisch. Wir sorgen für den perfekten Platz für Sie.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <div className="text-center bg-card rounded-lg shadow-lg p-8 mb-16 border border-border">
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4 text-balance">
            Bereit für ein unvergessliches Diner?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Lassen Sie sich von unserer authentischen deutschen Küche verwöhnen. Reservieren Sie noch heute Ihren Tisch
            oder bestellen Sie bequem nach Hause.
          </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link href="/reservierung">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
            >
              <Calendar className="h-6 w-6" />
              Jetzt Tisch reservieren
            </Button>
          </Link>

          <Link href="/bestellen">
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 bg-transparent"
            >
              <ShoppingBag className="h-6 w-6" />
              Jetzt bestellen
            </Button>
          </Link>
        </div>

        {/* Footer Section */}
        </div>
        <footer className="bg-card text-card-foreground rounded-lg shadow-lg p-8 border border-border">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Restaurant Info */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Rex´s Diner</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ihr authentisches deutsches Restaurant mit Tradition und Qualität. Seit Jahren verwöhnen wir unsere
                Gäste mit köstlichen Gerichten und herzlichem Service.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Kontakt</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p>{contactInfo.address}</p>
                    <p>{contactInfo.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <p>
                    <a
                      href={contactInfo.discord}
                      className="text-primary hover:text-primary/80 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Discord Server
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Öffnungszeiten</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Mo-Do: {openingHours["Mo-Do"]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fr-Sa: {openingHours["Fr-Sa"]}</span>
                </div>
                <div className="flex justify-between">
                  <span>So: {openingHours["So"]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border mt-8 pt-6 text-center">
            <p className="text-muted-foreground">© 2026 Rex´s Diner. Alle Rechte vorbehalten.</p>
            <p className="text-muted-foreground text-sm mt-2">Hosted by Vercel</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
