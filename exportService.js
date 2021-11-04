const xlsx = require("xlsx");
const path = require("path");

const exportExcel = (data, workSheetColumnNames, workSheetName, filePath) => {
  const workBook = xlsx.utils.book_new();
  const workSheetData = [workSheetColumnNames, ...data];
  const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);
  xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName);
  xlsx.writeFile(workBook, path.resolve(filePath));
};

const exportDataToExcel = (
  jsonData,
  workSheetColumnNames,
  workSheetName,
  filePath
) => {
  const data = jsonData.map((res) => {
    return [
      res["description"],
      res["additional_description"],
      res["Name"],
      res["Article code"],
      res["Thread type"],
      res["Thread size"],
      res["Diameter"],
      res["Pitch"],
      res["Shank Diameter"],
      res["Square diameter"],
    ];
  });
  exportExcel(data, workSheetColumnNames, workSheetName, filePath);
};

module.exports = exportDataToExcel;
