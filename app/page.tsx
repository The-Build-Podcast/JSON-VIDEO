"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Download, ArrowRight, Edit3, Check, Copy } from "lucide-react"

interface PromptComponents {
  subject: string
  activity: string
  environment: string
  camera_style: string
  lighting: string
  mood: string
  visual_style: string
  duration: string
  audio_description: string
  technical_specs: string
}

const DEFAULT_COMPONENTS: PromptComponents = {
  subject: "",
  activity: "Dynamic movement and interaction",
  environment: "Professional studio setting",
  camera_style: "Cinematic with smooth movements",
  lighting: "Professional three-point lighting",
  mood: "Engaging and vibrant",
  visual_style: "High-quality, photorealistic",
  duration: "8",
  audio_description: "Ambient sound with clear audio",
  technical_specs: "1080p, 24fps, 16:9 aspect ratio",
}

export default function AIVideoPromptEnhancer() {
  const [currentStep, setCurrentStep] = useState(1)
  const [rawPrompt, setRawPrompt] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [promptComponents, setPromptComponents] = useState<PromptComponents>(DEFAULT_COMPONENTS)

  const enhancePrompt = async () => {
    if (!rawPrompt.trim()) return
    setIsEnhancing(true)

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: rawPrompt }),
      })

      if (!response.ok) throw new Error("API returned non-200")

      const data = await response.json()

      // If the route returns components use them, otherwise fall back
      const nextComponents: PromptComponents =
        data?.components && typeof data.components === "object"
          ? { ...DEFAULT_COMPONENTS, ...data.components }
          : { ...DEFAULT_COMPONENTS, subject: rawPrompt }

      setPromptComponents(nextComponents)
      setCurrentStep(2)
    } catch (err) {
      console.error("Error enhancing prompt:", err)
      // Safe fallback – at minimum the subject is the raw prompt
      setPromptComponents({ ...DEFAULT_COMPONENTS, subject: rawPrompt })
      setCurrentStep(2)
    } finally {
      setIsEnhancing(false)
    }
  }

  const updateComponent = (key: keyof PromptComponents, value: string) => {
    setPromptComponents((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const generateFinalJSON = () => {
    const enhancedPrompt = `${promptComponents.subject} ${promptComponents.activity}. ${promptComponents.environment}. ${promptComponents.visual_style} with ${promptComponents.lighting}. ${promptComponents.mood} atmosphere.`

    const jsonStructure = {
      prompt: enhancedPrompt,
      negative_prompt: "blurry, low-resolution, distorted, pixelated, amateur, poor lighting, shaky camera",
      prompt_language: "en",
      input: {
        prompt: enhancedPrompt,
        negativePrompt: "blurry, low-resolution, distorted, pixelated, amateur, poor lighting, shaky camera",
        image: null,
        length: Number.parseInt(promptComponents.duration) || 8,
        aspectRatio: "16:9",
        resolution: "1080p",
        seed: Math.floor(Math.random() * 4294967295),
        generateAudio: true,
      },
      config: {
        duration_seconds: Number.parseInt(promptComponents.duration) || 8,
        aspect_ratio: "16:9",
        resolution: "1080p",
        generate_audio: true,
        sampleCount: 1,
        seed: Math.floor(Math.random() * 4294967295),
        style: promptComponents.visual_style,
        fps: 24,
        motion_strength: 0.7,
        style_strength: 0.8,
      },
      parameters: {
        aspectRatio: "16:9",
        durationSeconds: Number.parseInt(promptComponents.duration) || 8,
        enhancePrompt: true,
        generateAudio: true,
        negativePrompt: "blurry, low-resolution, distorted, pixelated, amateur, poor lighting, shaky camera",
        personGeneration: "allow_all",
        resolution: "1080p",
        sampleCount: 1,
        seed: Math.floor(Math.random() * 4294967295),
        storageUri: null,
      },
      camera: [
        {
          shot: promptComponents.camera_style,
          motion: "Smooth tracking movement",
          angle: "Eye-level with cinematic composition",
          lens_type: "35mm equivalent",
          frame_rate: "24fps",
          film_grain: "Light cinematic grain",
          color_grading: "Professional color grade",
        },
      ],
      environment: {
        location: promptComponents.environment,
        details: "Rich environmental details with proper depth",
        time_of_day: "Optimal lighting conditions",
        weather: "Clear with atmospheric elements",
        lighting: promptComponents.lighting,
      },
      characters: [
        {
          description: promptComponents.subject,
          action: promptComponents.activity,
          emotion: promptComponents.mood,
        },
      ],
      subject: {
        description: promptComponents.subject,
        action: promptComponents.activity,
      },
      visual_details: "Rich textures, proper shadows, realistic physics, smooth animations",
      cinematography: promptComponents.camera_style + " with " + promptComponents.lighting,
      audio: promptComponents.audio_description,
      color_palette: "Harmonious color scheme with proper saturation and contrast",
      dialogue: [],
      visual_rules: ["no text overlays", "no watermarks", "no low-quality artifacts"],
      image: {
        bytesBase64Encoded: null,
        gcsUri: null,
        mimeType: null,
      },
      lastFrame: {
        bytesBase64Encoded: null,
        gcsUri: null,
        mimeType: null,
      },
      video: {
        gcsUri: null,
        mimeType: null,
      },
      transition: [
        {
          type: "smooth",
          duration: 0.5,
        },
      ],
      watermark: {
        text: null,
        position: null,
      },
      webhookUrl: null,
      output: {
        format: "mp4",
        gcsUri: null,
      },
      instances: [],
      clip_id: null,
      setting_description: promptComponents.environment,
      camera_style: promptComponents.camera_style,
      action_description: promptComponents.activity,
      dialogue_to_speak: null,
    }

    return jsonStructure
  }

  const downloadJSON = () => {
    const jsonData = generateFinalJSON()
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "enhanced-video-prompt.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const previewJSON = () => {
    setCurrentStep(3)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Video Prompt Enhancer</h1>
          <p className="text-slate-600">Transform your basic video prompts into comprehensive generation parameters</p>

          {/* Progress Steps */}
          <div className="flex justify-center items-center mt-6 space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? "text-blue-600" : "text-slate-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-300"}`}
              >
                1
              </div>
              <span className="text-sm font-medium">Raw Prompt</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-blue-600" : "text-slate-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-300"}`}
              >
                2
              </div>
              <span className="text-sm font-medium">Component Editing</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div className={`flex items-center space-x-2 ${currentStep >= 3 ? "text-blue-600" : "text-slate-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-slate-300"}`}
              >
                3
              </div>
              <span className="text-sm font-medium">Final JSON</span>
            </div>
          </div>
        </div>

        {/* Step 1: Raw Prompt Input */}
        {currentStep === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                Step 1: Enter Your Video Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="raw-prompt" className="text-sm font-medium">
                  Describe your video idea
                </Label>
                <Textarea
                  id="raw-prompt"
                  placeholder="Enter your basic video prompt here... (e.g., 'A cat playing with a ball of yarn in a cozy living room')"
                  value={rawPrompt}
                  onChange={(e) => setRawPrompt(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
              </div>
              <Button onClick={enhancePrompt} disabled={!rawPrompt.trim() || isEnhancing} className="w-full" size="lg">
                {isEnhancing ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing Prompt...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance & Break Down Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Component Editing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Step 2: Refine Your Components</h2>
              <p className="text-slate-600">Edit each component to perfect your video prompt</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(promptComponents ?? DEFAULT_COMPONENTS).map(([key, value]) => (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {key.replace("_", " ")}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={value}
                      onChange={(e) => updateComponent(key as keyof PromptComponents, e.target.value)}
                      className="min-h-[80px] resize-none"
                      placeholder={`Describe the ${key.replace("_", " ")}...`}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back to Edit Prompt
              </Button>
              <Button onClick={previewJSON} size="lg">
                <Check className="mr-2 h-4 w-4" />
                Generate Final JSON
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Final JSON Preview and Download */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Step 3: Your Enhanced JSON</h2>
              <p className="text-slate-600">Review and download your comprehensive video generation parameters</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Enhanced Video Prompt JSON
                  <Button onClick={downloadJSON} className="ml-4">
                    <Download className="mr-2 h-4 w-4" />
                    Download JSON
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(generateFinalJSON(), null, 2))
                  }}
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 z-10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-[500px] text-sm pr-16">
                  <code>{JSON.stringify(generateFinalJSON(), null, 2)}</code>
                </pre>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back to Edit Components
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep(1)
                  setRawPrompt("")
                  setPromptComponents(DEFAULT_COMPONENTS)
                }}
              >
                Start New Prompt
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
