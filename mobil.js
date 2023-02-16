const express = require ("express")
const router = express.Router()
const db = require ("./database/db")
const multer = require("multer") // untuk upload file
const path = require("path") // untuk memanggil path direktori
const fs = require("fs") // untuk manajemen file


// variabel untuk konfigurasi proses upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // set file storage
        cb(null, './image');
    },
    filename: (req, file, cb) => {
        // generate file name 
        cb(null, "image-" + Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({ storage: storage })

// endpoint untuk menambah data penyewaan mobil

router.post("/mobil", upload.single("image"), (req, res) => {
    // prepare data
    let data = {
        id_mobil: req.body.id_mobil,
        nomor_mobil: req.body.nomor_mobil,
        merk: req.body.merk,
        jenis: req.body.jenis,
        warna: req.body.warna,
        tahun_pembuatan: req.body.tahun_pembuatan,
        biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
        image: req.file.filename
    }

    if (!req.file) {
        // jika tidak ada file yang diupload
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else {
        // create sql insert
        let sql = "insert into mobil set ?"

        // run query
        db.query(sql, data, (error, result) => {
            if (error) throw error
            res.json({
                message: result.affectedRows + " data berhasil disimpan"
            })
        })
    }
})

// endpoint untuk mengubah data penyewaan mobil
router.put("/mobil", upload.single("image"), (req, res) => {
    let data = null, sql = null
    // paramter perubahan data
    let param = { id_mobil: req.body.id_mobil }

    if (!req.file) {
        // jika tidak ada file yang dikirim = update data saja
        data = {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
        }
    } else {
        // jika mengirim file = update data + reupload
        data = {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
            image: req.file.filename
        }

        // get data yg akan diupdate utk mendapatkan nama file yang lama
        sql = "select * from mobil where ?"
        // run query
        db.query(sql, param, (err, result) => {
            if (err) throw err
            // tampung nama file yang lama
            let fileName = result[0].image

            // hapus file yg lama
            let dir = path.join(__dirname, "image", fileName)
            fs.unlink(dir, (error) => { })
        })

    }

    // create sql update
    sql = "update mobil set ? where ?"

    // run sql update
    db.query(sql, [data, param], (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil diubah"
            })
        }
    })
})

// endpoint ambil data penyewaan mobil
router.get("/mobil", (req, res) => {
    // create sql query
    let sql = "select * from mobil"

    // run query
    db.query(sql, (error, result) => {
        if (error) throw error
        res.json({
            data: result,
            count: result.length
        })
    })
})

// endpoint untuk menghapus data penyewaan mobil
router.delete("/mobil/:id_mobil", (req, res) => {
    let param = { id_mobil: req.params.id_mobil }

    // ambil data yang akan dihapus
    let sql = "select * from mobil where ?"
    // run query
    db.query(sql, param, (error, result) => {
        if (error) throw error

        // tampung nama file yang lama
        let fileName = result[0].image

        // hapus file yg lama
        let dir = path.join(__dirname, "image", fileName)
        fs.unlink(dir, (error) => { })
    })

    // create sql delete
    sql = "delete from mobil where ?"

    // run query
    db.query(sql, param, (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil dihapus"
            })
        }
    })
})

module.exports=router