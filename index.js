const Jimp = require("jimp");
const fs = require("fs");

function CreateCollage(mainPictureSrc, smallPictureSrcArray, resultPath) {
    Jimp.read(mainPictureSrc, function(err, val) { // load main picture (val)
        if (!err) {
            LoadImageArray(smallPictureSrcArray, function(res) { // load array of small pictures (res)
                let result = PickPictures(val, res);
                SavePicture(resultPath, result);
            });
        } else {
            throw err;
        }
    });
}
function PickPictures(mainPicture, smallPictureArray) {
    let res = mainPicture.clone();
    let cellWidth = res.bitmap.width / smallPictureArray[0].bitmap.width;
    let cellHeight = res.bitmap.height / smallPictureArray[0].bitmap.height;
    for (let y = 0; y < cellHeight; y++) {
        for (let x = 0; x < cellWidth; x++) {
            let measure = [];
            for (let i = 0; i < smallPictureArray.length; i++) {
                measure.push({x: x, y: y, i: i, index: Compare(mainPicture, smallPictureArray[i], x * smallPictureArray[0].bitmap.width, y * smallPictureArray[0].bitmap.height)});
            }
            let min = measure.getMinValue((obj) => {
                return obj.index;
            });
            Print(res, smallPictureArray[min.i], min.x * smallPictureArray[0].bitmap.width, min.y * smallPictureArray[0].bitmap.height);
        }
    }
    return res;
}
function SavePicture(path, pic) {
    pic.write(path + "/result." + pic.getExtension());
}
function Print(target, picture, _x, _y,) {
    for (let y = _y; y < _y + picture.bitmap.height; y++) {
        for (let x = _x; x < _x + picture.bitmap.width; x++) {
            target.setPixelColor(picture.getPixelColor(x - _x, y - _y), x, y);
        }
    }
}
Array.prototype.getMinValue = function(cb) {
    let item = this[0];
    for (let i = 1; i < this.length; i++) {
        if (cb(this[i]) < cb(item)) {
            item = this[i];
        }
    }
    return item;
}
function Compare(original, clone, _x, _y) {
    let _width = clone.bitmap.width;
    let _height = clone.bitmap.height;
    let pixelCount = _width * _height;
    let compareCount = 0;
    for (let y = _y; y < _y + _height; y++) {
        for (let x = _x; x < _x + _width; x++) {
            let oColor = Jimp.intToRGBA(original.getPixelColor(x, y));
            let cColor = Jimp.intToRGBA(clone.getPixelColor(x - _x, y - _y));
            compareCount += (Math.abs(oColor.r - cColor.r) + Math.abs(oColor.g - cColor.g) + Math.abs(oColor.b - cColor.b)) / pixelCount;
        }
    }
    return compareCount;
}
function LoadImageArray (array = [], cb, i = 0, res = []) {
    if (i < array.length) {
        Jimp.read(array[i], function(err, val) {
            if (!err) {
                res[i] = val;
                LoadImageArray(array, cb, i + 1, res);
            }
        });
    } else {
        cb(res);
    }
}