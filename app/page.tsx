"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPasteSchema, type CreatePasteInput } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Copy, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function Home() {
  const [pasteUrl, setPasteUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePasteInput>({
    resolver: zodResolver(createPasteSchema),
    defaultValues: {
      content: "",
      ttl_seconds: undefined,
      max_views: undefined,
    },
  })

  const onSubmit = async (data: CreatePasteInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Failed to create paste")
        return
      }

      const result = await response.json()
      setPasteUrl(result.url)
      reset()
      toast.success("Paste created successfully!")
    } catch (error) {
      console.error("Error creating paste:", error)
      toast.error("Failed to create paste. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = async () => {
    if (pasteUrl) {
      await navigator.clipboard.writeText(pasteUrl)
      setCopied(true)
      toast.success("URL copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Pastebin-Lite</h1>
            <p className="text-muted-foreground">
              Share text snippets with optional expiration and view limits
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create a New Paste</CardTitle>
            <CardDescription>
              Enter your text and optionally set expiration time or view limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your text here..."
                  className="min-h-[200px] font-mono"
                  {...register("content")}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ttl_seconds">TTL (Time to Live) in seconds</Label>
                  <Input
                    id="ttl_seconds"
                    type="number"
                    placeholder="e.g., 3600"
                    {...register("ttl_seconds", {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.ttl_seconds && (
                    <p className="text-sm text-destructive">{errors.ttl_seconds.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Optional: Paste will expire after this many seconds
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_views">Max Views</Label>
                  <Input
                    id="max_views"
                    type="number"
                    placeholder="e.g., 5"
                    {...register("max_views", {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.max_views && (
                    <p className="text-sm text-destructive">{errors.max_views.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Optional: Paste will expire after this many views
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Paste"
                )}
              </Button>
            </form>

            {pasteUrl && (
              <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm text-muted-foreground mb-1 block">
                      Your paste URL:
                    </Label>
                    <a
                      href={pasteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all text-sm font-mono"
                    >
                      {pasteUrl}
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}