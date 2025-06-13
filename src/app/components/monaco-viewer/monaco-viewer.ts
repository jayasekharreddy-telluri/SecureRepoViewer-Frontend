import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';

declare const require: any;

@Component({
  selector: 'app-monaco-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monaco-viewer.html',
  styleUrls: ['./monaco-viewer.css']
})
export class MonacoViewer implements AfterViewInit, OnChanges, OnDestroy {
  @Input() code: string = '';

  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLDivElement>;
  private editorInstance: any = null;

  ngAfterViewInit(): void {
    this.initMonacoEditor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code'] && this.editorInstance) {
      this.editorInstance.setValue(this.code || '');
    }
  }

  ngOnDestroy(): void {
    if (this.editorInstance) {
      this.editorInstance.dispose();
    }
  }

 private initMonacoEditor(): void {
  const baseUrl = '/assets/monaco';
  const require = (window as any).require;

  if (require) {
    require.config({ paths: { vs: `${baseUrl}/vs` } });

    // Optional: Configure Monaco environment
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function () {
  return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
    self.MonacoEnvironment = { baseUrl: '${baseUrl}/' };
    importScripts('${baseUrl}/vs/base/worker/workerMain.js');`
  )}`;
}

    };

    require(['vs/editor/editor.main'], () => {
      this.editorInstance = (window as any).monaco.editor.create(this.editorContainer.nativeElement, {
        value: this.code,
        language: 'typescript',
        theme: 'vs-dark',
        readOnly: true,
        automaticLayout: true
      });
    });
  } else {
    console.error('RequireJS is not loaded. Make sure loader.js is properly linked.');
  }
}

}
