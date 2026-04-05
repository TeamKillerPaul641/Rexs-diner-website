import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UeberUnsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Über uns
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Entdecken Sie die Geschichte, Werte und Leidenschaft hinter Rex´s Diner
          </p>
        </div>

        {/* About Content */}
        <div className="bg-card rounded-lg shadow-sm p-8 mb-12 border border-border">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <h2 className="text-3xl font-semibold text-card-foreground mb-6">
                Unsere Geschichte
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Rex´s Diner wurde 2015 von einem Team von kulinarischen Enthusiasten
                gegründet, die eine Leidenschaft für authentische, hochwertige
                Küche teilen. Was als kleines Familienrestaurant begann, hat sich
                zu einem beliebten Treffpunkt für Feinschmecker und
                Genießer entwickelt.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Unser erfahrenes Küchenteam verwendet nur die frischesten Zutaten
                und traditionelle Zubereitungsmethoden, um Ihnen ein
                unvergessliches kulinarisches Erlebnis zu bieten. Wir glauben,
                dass Essen nicht nur Nahrung ist, sondern eine Möglichkeit,
                Menschen zusammenzubringen und Erinnerungen zu schaffen.
              </p>
            </div>
            <div className="bg-muted rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Unsere Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Bei Rex´s Diner streben wir danach, jedem Gast ein außergewöhnliches
                kulinarisches Erlebnis zu bieten, das Geschmack, Qualität und
                herzlichen Service vereint. Wir glauben an die Kraft des Essens,
                um Menschen zusammenzubringen und unvergessliche Momente zu
                schaffen.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-12">
            <h2 className="text-3xl font-semibold text-card-foreground mb-8 text-center">
              Unsere Werte
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold text-xl">
                    Q
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  Qualität
                </h3>
                <p className="text-muted-foreground">
                  Wir verwenden nur die besten Zutaten und arbeiten mit lokalen
                  Lieferanten zusammen, um Frische und Qualität zu garantieren.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold text-xl">
                    T
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  Tradition
                </h3>
                <p className="text-muted-foreground">
                  Wir ehren traditionelle Kochkunst und bringen sie in die heutige
                  Zeit, indem wir klassische Rezepte mit modernen Akzenten
                  neu interpretieren.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold text-xl">
                    S
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  Service
                </h3>
                <p className="text-muted-foreground">
                  Unser Team sorgt dafür, dass sich jeder Gast willkommen und
                  geschätzt fühlt. Wir bieten herzlichen und professionellen
                  Service, der zu einem unvergesslichen Erlebnis beiträgt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
