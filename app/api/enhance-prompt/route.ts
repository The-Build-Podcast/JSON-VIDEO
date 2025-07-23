import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const PromptComponentsSchema = z.object({
  subject: z.string().describe("The main subject or character in the video"),
  activity: z.string().describe("What the subject is doing or the main action"),
  environment: z.string().describe("The setting, location, or background"),
  camera_style: z.string().describe("Camera movement, angles, and shot types"),
  lighting: z.string().describe("Lighting conditions and mood"),
  mood: z.string().describe("Overall emotional tone and atmosphere"),
  visual_style: z.string().describe("Art style, quality, and visual treatment"),
  duration: z.string().describe("Suggested video length in seconds"),
  audio_description: z.string().describe("Sound effects, music, or audio elements"),
  technical_specs: z.string().describe("Resolution, frame rate, and technical requirements"),
})

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        components: PromptComponentsSchema,
      }),
      prompt: `
        Analyze this video prompt and break it down into detailed components for video generation: "${prompt}"
        
        For each component, provide specific, actionable descriptions that would help an AI video generator create high-quality content:
        
        - Subject: Identify the main character, object, or focus
        - Activity: Describe the specific actions or movements
        - Environment: Detail the setting, location, and background elements
        - Camera Style: Suggest appropriate camera movements, angles, and shot compositions
        - Lighting: Recommend lighting conditions that enhance the scene
        - Mood: Define the emotional tone and atmosphere
        - Visual Style: Specify the artistic style, quality level, and visual treatment
        - Duration: Suggest an appropriate video length (typically 5-10 seconds)
        - Audio Description: Describe relevant sounds, music, or audio elements
        - Technical Specs: Recommend resolution, frame rate, and other technical parameters
        
        Make each component detailed enough to guide video generation but concise enough to be easily editable.
      `,
    })

    return Response.json({ components: object.components })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return Response.json({ error: "Failed to enhance prompt" }, { status: 500 })
  }
}
