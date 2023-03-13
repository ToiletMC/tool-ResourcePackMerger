const AdmZip = require('adm-zip');
const path = require('path');

const zip = new AdmZip('./original_resource_packs/magic.zip');
const targetFolder = 'assets/minecraft/models/item'; // 遍历example.zip中assets/minecraft/models/item目录下的文件

zip.getEntries().forEach(entry => {
  if (entry.entryName.startsWith(targetFolder) && !entry.isDirectory) {
    const filePath = path.join(__dirname, entry.entryName);
    console.log('File found: ' + filePath);
  }
});
