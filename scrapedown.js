const rp = require('request-promise')
const $ = require('cheerio')
var https = require('https')
var fs = require('fs')
const Path = require('path')
const url = 'https:// url with some files in <a> tags'

rp(url)
  .then(function (html) {
    let links = $('td a', html)
    let linksLength = links.length
    for (var i = 0; i <= linksLength; i++) {
    // for (var i = 0; i <= 2; i++) { # debug
      let rc = RegExp('\.pdf$')
      let fileName = links[i].attribs.href
      if (rc.test(fileName)) {
        let linkFull = url + '/' + fileName
        let dest = Path.resolve(__dirname, 'files', fileName)
        download(linkFull, dest)
      }
    }
  })
  .catch(function (err) {
    console.log(err)
  })


var download = function (url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest, {
      flags: 'wx'
    })

    const request = https.get(url, response => {
      if (response.statusCode === 200) {
        response.pipe(file)
      } else {
        file.close()
        fs.unlink(dest, () => {})
        Promise.reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`)).
          catch(error => {
            console.log('caught: ', error.message);
          })
      }
    })

    request.on("error", err => {
      file.close()
      fs.unlink(dest, () => {})
      Promise.reject(new Error(err.message)).
        catch (error => {
          console.log('caught: ', error.message);
        })
    })

    file.on("finish", () => {
      Promise.resolve(dest + ' saved!').
        then(function (value) {
          console.log(value);
        });
    })

    file.on("error", err => {
      file.close()

      if (err.code === "EEXIST") {
        Promise.reject(new Error('File already exists')).
          catch(error => {
            console.log('caught: ', error.message);
          })
      } else if (err.code === "ECONNRESET") {
        Promise.reject(new Error('Connection hung up')).
          catch(error => {
            console.log('caught: ', error.message);
          })
      } else {
        fs.unlink(dest, () => {})
        Promise.reject(new Error(err.message)).
          catch(error => {
            console.log('caught: ', error.message);
          })
      }
    })
  })
}
