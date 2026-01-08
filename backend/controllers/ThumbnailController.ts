import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';
import {
    GenerateContentConfig,
    HarmBlockThreshold,
    HarmCategory
} from '@google/genai';
import ai from '../config/ai.js';
import path from 'node:path';
import fs from 'fs'
import {v2 as cloudinary} from 'cloudinary'

const stylePrompts = {
    'Bold & Graphic':
        'Use bold colors, strong contrasts, and graphic elements to create a visually striking thumbnail.',
    'Tech/Futuristic':
        'Incorporate sleek, modern design elements with a futuristic vibe, using metallic colors and tech-inspired graphics.',
    'Minimalist':
        'Focus on simplicity with clean lines, ample white space, and minimal text to create an elegant thumbnail.',
    'Photorealistic':
        'Create a lifelike thumbnail using high-quality images and realistic details to capture attention.',
    'Illustrated':
        'Design a hand-drawn or digitally illustrated thumbnail with vibrant colors and creative artwork.'
};

const colorSchemeDescriptions = {
    vibrant: 'bright and lively colors that catch the eye',
    sunset: 'warm hues reminiscent of a beautiful sunset',
    forest: 'earthy greens and browns inspired by nature',
    neon: 'glowing, fluorescent colors that pop against dark backgrounds',
    purple: 'various shades of purple for a royal and mysterious feel',
    monochrome: 'a single color in varying shades for a sleek look',
    ocean: 'cool blues and aquas that evoke the sea',
    pastel: 'soft, muted colors for a gentle and calming effect'
};

export const generateThumbnail = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;

        const {
            title,
            prompt: user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay
        } = req.body;

        const thumbnail = await Thumbnail.create({
            userId,
            title,
            prompt_used: user_prompt,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true
        });

        const model = 'gemini-3-pro-image-preview';

        const generateConfig: GenerateContentConfig = {
            maxOutputTokens: 32768 ,
            temperature: 1,
            topP: 0.95,
            responseModalities: ['IMAGE'],
            imageConfig: {
                aspectRatio: aspect_ratio || '16:9',
                imageSize: '1K'
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.OFF
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.OFF
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.OFF
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.OFF
                }
            ]
        };

        let prompt = `Create a ${
            stylePrompts[style as keyof typeof stylePrompts]
        }`;

        if (color_scheme) {
            prompt += ` Use a ${colorSchemeDescriptions[
                color_scheme as keyof typeof colorSchemeDescriptions
            ]} color scheme.`;
        }

        if (user_prompt) {
            prompt += ` Additionally, incorporate the following elements: ${user_prompt}.`;
        }

        prompt += ` The thumbnail should prominently feature the title: "${title}".`;

        const aiResponse = await ai.models.generateContent({
            model,
            contents: [prompt],
            config: generateConfig
        });

        //check if aiResponse is valid
        if (!aiResponse?.candidates?.[0]?.content?.parts) {
            throw new Error('Invalid AI response');
        }

        const parts = aiResponse.candidates[0].content.parts;

        let finalBuffer: Buffer | null = null;

        for (const part of parts) {
            if (part.inlineData?.data) {
                finalBuffer = Buffer.from(part.inlineData.data, 'base64');
            }
        }

        const filename = 'final-output-${Date.now()}.png';
        const filepath = path.join('images', filename);

        fs.mkdirSync('images', { recursive: true });

        fs.writeFileSync(filepath, finalBuffer!);

        const uploadResult = await cloudinary.uploader.upload(filepath, {
            resource_type: 'image',
        })
        thumbnail.image_url = uploadResult.url;
        thumbnail.isGenerating = false;
        await thumbnail.save();

        res.status(200).json({ message: 'Thumbnail generated successfully', thumbnail });

        fs.unlinkSync(filepath);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {userId} = req.session;

        await Thumbnail.findByIdAndDelete({_id: id, userId});
        res.status(200).json({ message: 'Thumbnail deleted successfully' });

    }catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error', error });
    }
}