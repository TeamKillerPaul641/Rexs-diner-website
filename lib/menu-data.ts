import { createClient } from "@/lib/supabase/client"

export interface MenuItem {
  id: number
  name: string
  description: string
  price: string
  category: string
  rating: number
  image?: string
}

// Menüpunkte aus Supabase laden
export const getMenuItems = async (): Promise<MenuItem[]> => {
  const supabase = createClient()
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("Fehler beim Laden der Speisekarte:", error)
    return []
  }

  return data || []
}

// Menüpunkt speichern/aktualisieren
export const saveMenuItem = async (item: Omit<MenuItem, "id"> & { id?: number }): Promise<MenuItem | null> => {
  const supabase = createClient()
  if (!supabase) return null

  if (item.id) {
    // Update existing item
    const { data, error } = await supabase
      .from("menu_items")
      .update({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        rating: item.rating,
        image: item.image || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .select()
      .single()

    if (error) {
      console.error("Fehler beim Aktualisieren des Menüpunkts:", error)
      return null
    }
    return data
  } else {
    // Insert new item
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        rating: item.rating || 0,
        image: item.image || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Fehler beim Speichern des Menüpunkts:", error)
      return null
    }
    return data
  }
}

// Menüpunkt löschen
export const deleteMenuItem = async (id: number): Promise<boolean> => {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Fehler beim Löschen des Menüpunkts:", error)
    return false
  }
  return true
}

// Alle Menüpunkte speichern (Batch)
export const saveMenuItems = async (items: MenuItem[]): Promise<boolean> => {
  const supabase = createClient()
  if (!supabase) return false

  // Erst alle löschen, dann neu einfügen
  const { error: deleteError } = await supabase
    .from("menu_items")
    .delete()
    .neq("id", 0)

  if (deleteError) {
    console.error("Fehler beim Löschen der Menüpunkte:", deleteError)
    return false
  }

  if (items.length === 0) return true

  const itemsToInsert = items.map(item => ({
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    rating: item.rating || 0,
    image: item.image || null,
  }))

  const { error: insertError } = await supabase
    .from("menu_items")
    .insert(itemsToInsert)

  if (insertError) {
    console.error("Fehler beim Speichern der Menüpunkte:", insertError)
    return false
  }

  return true
}

// Export zu JSON-Datei (bleibt client-side)
export const exportMenuToFile = (items: MenuItem[]): void => {
  const dataStr = JSON.stringify(items, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `speisekarte_${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Import aus JSON-Datei
export const importMenuFromFile = (file: File): Promise<MenuItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string
        const items = JSON.parse(result) as MenuItem[]
        resolve(items)
      } catch (error) {
        reject(new Error("Ungültige JSON-Datei"))
      }
    }
    reader.onerror = () => reject(new Error("Fehler beim Lesen der Datei"))
    reader.readAsText(file)
  })
}
