// Window data model
class WindowData {
  constructor(data = {}, batchNo = '') {
    this.customer = data.Customer || '';
    this.id = data.ID || '';
    this.style = data.Style || '';
    this.width = data.W || '';
    this.height = data.H || '';
    this.fh = data.FH || '';
    this.frame = data.Frame || '';
    this.glass = data.Glass || '';
    this.argon = data.Argon || '';
    this.grid = data.Grid || '';
    this.color = data.Color || '';
    this.note = data.Note || '';
    this.batchNo = batchNo;
    this.checked = data.Checked || '';
  }

  // Get frame data
  getFrameData() {
    return {
      customer: this.customer,
      id: this.id,
      frame: this.frame,
      width: this.width,
      height: this.height,
      batchNo: this.batchNo
    };
  }

  // Get glass data
  getGlassData() {
    return {
      customer: this.customer,
      id: this.id,
      glass: this.glass,
      width: this.width,
      height: this.height,
      argon: this.argon,
      batchNo: this.batchNo
    };
  }

  // Get grid data
  getGridData() {
    return {
      customer: this.customer,
      id: this.id,
      grid: this.grid,
      width: this.width,
      height: this.height,
      batchNo: this.batchNo
    };
  }

  // Additional methods can be added for other tabs
}

export default WindowData; 