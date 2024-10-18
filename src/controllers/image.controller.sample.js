const catchAsync = require("../utils/catchAsync");
const db = require("../db/models/index");
const fs = require("fs");
const path = require("path");

const getImage = catchAsync(async (req, res) => {
  const imageName = req.params.fileName;
  const imagePath = path.join(__dirname, "../uploads", imageName);

  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(404).json({ status: "error", message: "Image not found" });
    } else {
      console.log("Image sent:", imagePath);
    }
    res.end();
  });
}); 

const getAllImages = catchAsync(async (req, res) => {
  let images = await db.comicbook.findAll();

  images = images.map((image) => ({
    id: image.id,
    name: image.name,
    fileName: image.fileName,
    path: image.path,
    description: image.description,
  }));

  res.status(200).json({
    status: "success",
    data: images,
  });
});

const addImage = catchAsync(async (req, res) => {
  const { name, base64, properties, description } = req.body;
  try {
    const img = await db.comicbook.findOne({ where: { name: name } });
    if (!img) {
      if (!base64 || !/^data:image\/(png|jpeg|jpg);base64,/.test(base64)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid image format. Please provide a valid base64 image.",
        });
      }

      const uploadsDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const base64Data = base64.replace(
        /^data:image\/(png|jpeg|jpg);base64,/,
        ""
      );

      const extension = base64.match(/^data:image\/(png|jpeg|jpg);base64,/)[1];
      const fileName = `${name}-${Date.now()}.${extension}`;
      const uploadPath = path.join(__dirname, "../uploads", fileName);
      fs.writeFileSync(
        uploadPath,
        base64Data,
        { encoding: "base64", flag: "w+", mode: 777 },
        (err) => {
          if (err) throw new Error("Image Upload Failed");
        }
      );

      const newImg = await db.comicbook.create({
        name,
        fileName: fileName,
        path: `/uploads/${fileName}`,
        description,
        properties,
      });

      res.status(201).json({
        status: "success",
        data: newImg,
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Image with this name already exists.",
      });
    }
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
});

const updateImage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, base64, properties, description } = req.body;

  const comicbook = await db.comicbook.findByPk(id);
  if (!comicbook) {
    return res.status(404).json({
      status: "error",
      message: "Comic book not found",
    });
  }

  comicbook.name = name !== undefined ? name : comicbook.name;
  comicbook.properties =
    properties !== undefined ? properties : comicbook.properties;
  comicbook.description =
    description !== undefined ? description : comicbook.description;

  if (base64) {
    if (!/^data:image\/(png|jpeg|jpg);base64,/.test(base64)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid image format. Please provide a valid base64 image.",
      });
    }

    const oldImagePath = path.join(
      __dirname,
      `../uploads/${comicbook.imageName}`
    );
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
    const base64Data = base64.replace(
      /^data:image\/(png|jpeg|jpg);base64,/,
      ""
    );
    const extension = base64.match(/^data:image\/(png|jpeg|jpg);base64,/)[1];
    const newFileName = `${comicbook.name}-${Date.now()}.${extension}`;
    const newImagePath = path.join(__dirname, "../uploads", newFileName);

    fs.writeFileSync(newImagePath, base64Data, "base64");
    comicbook.fileName = newFileName;
    comicbook.path = `/uploads/${newFileName}`;
  }
  await comicbook.save();

  res.status(200).json({
    status: "success",
    data: comicbook,
  });
});

const deleteImage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const comicbook = await db.comicbook.findByPk(id);
  if (!comicbook) {
    return res.status(404).json({
      status: "error",
      message: "Comic book not found",
    });
  }

  const imagePath = path.join(__dirname, `../uploads/${comicbook.imageName}`);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  await comicbook.destroy();

  res.status(204).json({
    status: "success",
    message: "Comic book deleted successfully",
  });
});

module.exports = {
  getImage,
  getAllImages,
  addImage,
  updateImage,
  deleteImage,
};
