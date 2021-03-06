export default class DocumentDownload {
  document: any;
  downloadUrl: string;

  constructor(data) {
    this.document = data && data.document ? data.document : [];
    this.downloadUrl = data && data.downloadUrl ? data.downloadUrl : "";
  }
}
