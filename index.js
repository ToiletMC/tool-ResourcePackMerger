const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const original_RP_Path = 'original_resource_packs';
const tmp_PR_Path = 'tmp_resource_pack';
const itemFolder = 'assets/minecraft/models/item';
const atlasesFile = 'assets/minecraft/atlases/blocks.json';

fs.readdir(original_RP_Path, function (err, files) {
  // 处理错误
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }

  // 遍历所有待处理的资源包
  files.forEach(function (file) {
    console.log('Processing: ' + file);

    // 简单合并 assets\minecraft\models\item 中的 json
    const zip = new AdmZip(path.join(original_RP_Path, file));
    zip.getEntries().forEach(entry => {
      if (entry.entryName.startsWith(itemFolder) && !entry.isDirectory) {
        tmpTargetFile = path.join(tmp_PR_Path, entry.entryName);

        // 使用accessSync函数同步判断文件是否存在
        try {
          fs.accessSync(tmpTargetFile, fs.constants.F_OK);
          console.log('Item exists, add new line now');
          console.log(tmpTargetFile);

          var existObj = JSON.parse(fs.readFileSync(tmpTargetFile, 'utf8'));
          var currentObj = JSON.parse(zip.readAsText(entry));
          existObj.overrides = existObj.overrides.concat(currentObj.overrides);
          fs.writeFileSync(tmpTargetFile, JSON.stringify(existObj));

        } catch (err) {
          console.error('Item does not exist, created now');
          console.error(tmpTargetFile);
          zip.extractEntryTo(entry.entryName, tmp_PR_Path);
        }

      }
    });

    // 简单合并 assets/minecraft/atlases 中的 josn
    try {
      fs.accessSync(path.join(tmp_PR_Path, atlasesFile), fs.constants.F_OK);
      var existObj = JSON.parse(fs.readFileSync(path.join(tmp_PR_Path, atlasesFile), 'utf8'));
      var currentObj = JSON.parse(zip.readAsText(zip.getEntry(atlasesFile)));
      existObj.sources = existObj.sources.concat(currentObj.sources);
      fs.writeFileSync(path.join(tmp_PR_Path, atlasesFile), JSON.stringify(existObj));
    } catch (err) {
      zip.extractEntryTo(atlasesFile, tmp_PR_Path);
    }

    // 将zip文件解压缩到指定目录
    zip.extractAllTo('tmp_resource_pack', false /* overwrite */);
  });

  // 在这里对 Item 中的 overrides 项目排序

  // 使用自定义文件覆盖资源包
  copyDirectory("custom_resource_pack", "tmp_resource_pack");

  // 开始打包...
  const zip = new AdmZip();
  zip.addLocalFolder(tmp_PR_Path);
  zip.writeZip("out.zip");
});


function copyDirectory(source, destination) {
  // 创建目标目录
  fs.mkdirSync(destination, { recursive: true });

  // 获取源目录中的所有文件
  const files = fs.readdirSync(source);

  // 处理每个文件
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);

    // 判断当前文件是否为目录，如果是则递归复制目录
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      // 否则直接复制文件
      fs.copyFileSync(sourcePath, destinationPath);
    }
  });
}