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
    this.disableActions();
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
          language: this.detectLanguage(this.code),
          theme: 'vs-dark',
          readOnly: true,
          automaticLayout: true,
          contextmenu: false,
          minimap: { enabled: false }
        });
      });
    } else {
      console.error('RequireJS is not loaded. Make sure loader.js is properly linked.');
    }
  }

  private detectLanguage(code: string): string {
    if (code.trim().startsWith('<')) return 'html';
    if (code.includes('import') || code.includes('from')) return 'typescript';
    if (code.includes('class ') && code.includes('public')) return 'java';
    if (code.includes('def ') || code.includes('print(')) return 'python';
    return 'plaintext';
  }

  private disableActions(): void {
    const container = this.editorContainer.nativeElement;

    container.addEventListener('contextmenu', e => e.preventDefault());
    container.addEventListener('copy', e => e.preventDefault());
    container.addEventListener('cut', e => e.preventDefault());
    container.addEventListener('paste', e => e.preventDefault());

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'p', 's', 'x'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });

    document.addEventListener('beforeprint', e => e.preventDefault());
  }
}
