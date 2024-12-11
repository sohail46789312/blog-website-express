import multer from "multer"

var filePath

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/temp")
    },
    filename: (req, file, cb) => {
        filePath = file.path
        cb(null, file.originalname)
    }
})

const upload = multer({storage})

async function onUpload () {
    await uploadToCloudinary(filePath)
}

export default upload