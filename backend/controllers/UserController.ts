import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";

// Get all thumbnails
export const getUsersThumbnails = async (req: Request, res: Response) => {
    try {
        const {userId} = req.session;

        const thumbnail = await Thumbnail.find({userId}).sort({createdAt: -1});
        res.status(200).json(thumbnail);

    }catch(error: any) {
        // handle error
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}


//Get one thumbnail
export const getThumbnailById = async (req: Request, res: Response) => {
    try {
        const {userId} = req.session;
        const {id} = req.params;

        const thumbnail = await Thumbnail.findOne({userId, _id: id});
        if (!thumbnail) {
            return res.status(404).json({ message: "Thumbnail not found" });
        }

        res.status(200).json(thumbnail);

    }catch(error: any) {
        // handle error
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}