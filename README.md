```angular2html
 downloadBlockchain() {
    this.loader.showLoader();
    this.blockhainService.downloadSignedFile(this.selectedBox.itemId).subscribe(res => {
      try {
        this.loader.hideLoader();
        this.fileService.save(res, `${ this.selectedBox.itemId }.zip`);
      } catch (e) {
        this.loader.hideLoader();
      }

    }, error => {
      this.loader.hideLoader();
      this.matSnack.open(`Error fetching zip ${ error?.error?.message || '' }`, 'error');
    });
  }
```
