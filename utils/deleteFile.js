const fs = require("fs")

const deletefile = (filepath) =>{
    if(!filepath) return
     if(fs.existsSync(filepath)) {
            fs.unlinkSync(filepath)
        }
    
}
module.exports = deletefile