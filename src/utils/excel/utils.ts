import * as XLSX from "xlsx";

/**
 * Excel转换选项接口
 */
export interface ExcelConvertOptions {
  removeLineBreaks: boolean; // 去除换行符
  convertDates: boolean; // 转换日期格式
  mergeSheets: boolean; // 合并多个工作表
}

/**
 * 处理Excel文件并转换为JSON
 * @param file - Excel文件
 * @param options - 转换选项
 * @returns Promise<any> - 转换后的JSON数据
 */
export const processExcelFile = async (
  file: File,
  options: ExcelConvertOptions
): Promise<any> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    let result: any;

    if (options.mergeSheets && workbook.SheetNames.length > 1) {
      // 合并多个工作表
      result = {};
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        result[sheetName] = convertSheetToColumnFormat(worksheet, options);
      });
    } else {
      // 只处理第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      result = convertSheetToColumnFormat(worksheet, options);
    }

    return result;
  } catch (error) {
    console.error("Excel文件处理错误:", error);
    throw new Error("文件处理失败，请检查文件格式是否正确");
  }
};

/**
 * 将工作表转换为column格式
 * @param worksheet - Excel工作表
 * @param options - 转换选项
 * @returns any[] - 转换后的数据数组1
 */
export const convertSheetToColumnFormat = (
  worksheet: any,
  options: ExcelConvertOptions
): any[] => {
  // 使用header: 1参数获取原始数组格式数据
  const jsonResult = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
  });

  if (jsonResult.length === 0) return [];

  // 过滤掉只有一条数据的行，找到第一个有效数据行
  let validDataStartIndex = 0;
  let columns: any[] = [];

  for (let i = 0; i < jsonResult.length; i++) {
    const row = jsonResult[i] as any[];
    // 计算非空且非undefined的有效数据列数
    const validColumns = row.filter(
      (cell) =>
        cell !== undefined &&
        cell !== null &&
        cell !== "" &&
        String(cell).trim() !== ""
    ).length;

    // 如果有效列数大于1，则认为是有效数据行
    if (validColumns > 1) {
      validDataStartIndex = i;
      columns = row; // 使用第一个有效行作为列名
      break;
    }
  }

  // 如果没有找到有效数据行，返回空数组
  if (validDataStartIndex === jsonResult.length - 1) return [];

  let jsonData: any[] = [];
  let prevObj: any = {};

  // 从有效数据行的下一行开始处理数据
  jsonResult
    .slice(validDataStartIndex + 1)
    .forEach((row: unknown, index: number) => {
      const rowData = row as any[]; // 类型断言
      const obj: any = { "column-0": index + 1 }; // 添加序号列

      columns.forEach((_col: any, i: number) => {
        let cellValue = rowData[i];

        // 去除换行符处理
        if (options.removeLineBreaks && typeof cellValue === "string") {
          cellValue = cellValue.replace(/[\n\r]/g, "");
        }

        // 日期格式转换处理
        if (
          options.convertDates &&
          /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(cellValue)
        ) {
          const dateParts = cellValue.split("/");
          const year = parseInt(dateParts[2]);
          const fullYear = year < 50 ? 2000 + year : 1900 + year;
          obj[
            "column-" + (i + 1)
          ] = `${fullYear}年${dateParts[0]}月${dateParts[1]}日`;
        } else {
          obj["column-" + (i + 1)] = cellValue;
        }
      });

      // 处理合并逻辑（与HTML版本保持一致）
      if (obj["column-1"] === undefined) {
        // 如果column-1是undefined，将column-3与前一条记录合并
        if (obj["column-3"] !== undefined && obj["column-3"] !== "undefined") {
          prevObj["column-3"] =
            (prevObj["column-3"] ? prevObj["column-3"] + ", " : "") +
            obj["column-3"];
        }
      } else {
        // 如果column-1不是undefined，添加到结果中
        jsonData.push(prevObj);
        prevObj = obj;
      }
    });

  // 添加最后一个对象
  jsonData.push(prevObj);

  // 移除第一个空对象（如果存在）
  if (jsonData[0] && jsonData[0]["column-1"] === undefined) {
    jsonData.shift();
  }

  return jsonData;
};

/**
 * 下载JSON数据为文件
 * @param jsonData - JSON数据
 * @param filename - 文件名（可选）
 */
export const downloadJsonFile = (jsonData: any, filename?: string): void => {
  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename || `excel_data_${new Date().getTime()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 验证文件是否为Excel格式
 * @param file - 文件对象
 * @returns boolean - 是否为Excel文件
 */
export const isExcelFile = (file: File): boolean => {
  return file.name.match(/\.(xls|xlsx)$/i) !== null;
};

/**
 * 格式化JSON字符串
 * @param data - 要格式化的数据
 * @param indent - 缩进空格数
 * @returns string - 格式化后的JSON字符串
 */
export const formatJsonString = (data: any, indent: number = 2): string => {
  return JSON.stringify(data, null, indent);
};
