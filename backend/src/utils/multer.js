import multer from "multer"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/temp")
    },
    filename: (req, file, cb) => {
        const filePath = file.path
        cb(null, file.originalname)
    }
})

const upload = multer({storage})

export default upload