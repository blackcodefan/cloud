import { Component, OnInit } from '@angular/core';
import {
  BookmarkDialogService,
  BordersAndShadingDialogService,
  BulletsAndNumberingDialogService,
  CellOptionsDialogService,
  ContextMenuService,
  EditorHistoryService,
  EditorService,
  FontDialogService,
  HyperlinkDialogService,
  ImageResizerService,
  ListDialogService,
  OptionsPaneService,
  PageSetupDialogService,
  ParagraphDialogService,
  PrintService,
  SearchService,
  SelectionService,
  SfdtExportService,
  StyleDialogService,
  StylesDialogService,
  TableDialogService,
  TableOfContentsDialogService,
  TableOptionsDialogService,
  TablePropertiesDialogService,
  TextExportService,
  WordExportService,
} from '@syncfusion/ej2-angular-documenteditor';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: [ './document-view.component.scss' ],
  providers: [ PrintService, SfdtExportService, WordExportService, TextExportService, SelectionService, SearchService, EditorService,
    ImageResizerService, EditorHistoryService, ContextMenuService, OptionsPaneService, HyperlinkDialogService, TableDialogService,
    BookmarkDialogService, TableOfContentsDialogService, PageSetupDialogService, StyleDialogService, ListDialogService,
    ParagraphDialogService, BulletsAndNumberingDialogService, FontDialogService, TablePropertiesDialogService,
    BordersAndShadingDialogService, TableOptionsDialogService, CellOptionsDialogService, StylesDialogService ],

})
export class DocumentViewComponent implements OnInit {
  apiUrl: string = `${ environment }processor/upload/word`;

  constructor() {
  }

  ngOnInit(): void {
  }

}
