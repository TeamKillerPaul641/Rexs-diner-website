"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { saveReview, getReviews, type Review } from "@/lib/user-data"

export default function BewertungPage() {
  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])

  // Lade bestehende Bewertungen aus Supabase
  useEffect(() => {
    const loadReviews = async () => {
      const data = await getReviews()
      setReviews(data)
    }
    loadReviews()
  }, [])

  const sendDiscordNotification = async (reviewData: any) => {
    try {
      await fetch("/api/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "new_review",
          data: reviewData,
        }),
      })
    } catch (error) {
      console.error("Failed to send Discord notification:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || rating === 0 || !comment.trim()) {
      alert("Bitte füllen Sie alle Felder aus und geben Sie eine Bewertung ab.")
      return
    }

    const reviewData = {
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString("de-DE"),
    }

    // Bewertung in Supabase speichern
    const savedReview = await saveReview(reviewData)
    
    if (!savedReview) {
      alert("Fehler beim Speichern der Bewertung. Bitte versuchen Sie es erneut.")
      return
    }

    setReviews([savedReview, ...reviews])
    await sendDiscordNotification(savedReview)

    // Reset form
    setName("")
    setRating(0)
    setComment("")
    setSubmitted(true)

    setTimeout(() => setSubmitted(false), 3000)
  }

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      const isActive = interactive ? (hoveredRating || rating) >= starValue : currentRating >= starValue

      return (
        <Star
          key={index}
          className={`h-6 w-6 cursor-pointer transition-colors ${
            isActive ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
          onClick={interactive ? () => setRating(starValue) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      )
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Bewertungen</h2>
          <p className="text-xl text-muted-foreground">
            Teilen Sie Ihre Erfahrung mit Rex Diner und helfen Sie anderen Gästen
          </p>
        </div>

        {/* Bewertungsformular */}
        <Card className="mb-12 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-card-foreground">Bewertung abgeben</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted && (
              <div className="bg-primary/20 border border-primary text-primary-foreground px-4 py-3 rounded mb-6">
                Vielen Dank für Ihre Bewertung! Sie wurde erfolgreich gespeichert.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
                  Ihr Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Paul Schmidt"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Bewertung</label>
                <div className="flex items-center gap-1">
                  {renderStars(rating, true)}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating > 0 ? `${rating}/5 Sterne` : "Klicken Sie auf die Sterne"}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-card-foreground mb-2">
                  Ihr Kommentar
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="z.B. Sehr nettes Restaurant mit ausgezeichnetem Service..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground py-3 text-lg font-semibold"
              >
                Bewertung abschicken
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bestehende Bewertungen */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6">Bewertungen unserer Gäste ({reviews.length})</h3>

          {reviews.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg">Noch keine Bewertungen vorhanden. Seien Sie der Erste!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg text-card-foreground">{review.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-muted-foreground">{review.rating}/5</span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
