// template for models by =sv=
export class SampleModel {
  
  constructor(obj?: any) {
    if (obj) {
      for (let field in obj) {
        if (typeof this[field] !== "undefined") {
          this[field] = obj && obj[field];
        }
      }
    }
  }
}