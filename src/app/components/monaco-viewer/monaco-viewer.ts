import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  HostListener
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

    // Disable right-click
    this.editorContainer.nativeElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Disable text selection
    this.editorContainer.nativeElement.addEventListener('selectstart', (e) => e.preventDefault());

    // Disable copy on editor container
    this.editorContainer.nativeElement.addEventListener('copy', (e) => e.preventDefault());

    // Global keyboard listener (Ctrl+C, Ctrl+A)
    window.addEventListener('keydown', this.disableKeys);

    // Blur effect on tab switch
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);
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
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('keydown', this.disableKeys);
  }

  private handleWindowBlur = () => {
    if (this.editorContainer) {
      this.editorContainer.nativeElement.style.filter = 'blur(8px)';
    }
  };

  private handleWindowFocus = () => {
    if (this.editorContainer) {
      this.editorContainer.nativeElement.style.filter = 'none';
    }
  };

  private disableKeys = (e: KeyboardEvent) => {
    const block =
      (e.ctrlKey || e.metaKey) &&
      (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'a');
    if (block) {
      e.preventDefault();
    }
  };
private initMonacoEditor(): void {
  const baseUrl = '/assets/monaco';
  const require = (window as any).require;

  if (require) {
    require.config({ paths: { vs: `${baseUrl}/vs` } });

    (window as any).MonacoEnvironment = {
      getWorkerUrl: () => {
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
        automaticLayout: true,
        contextmenu: false,
        selectionHighlight: false,
        renderWhitespace: 'none',
        occurrencesHighlight: false
      });

      // Block Ctrl+A / Ctrl+C inside Monaco
      this.editorInstance.onKeyDown((e: any) => {
        const key = e.browserEvent.key.toLowerCase();
        if ((e.browserEvent.ctrlKey || e.browserEvent.metaKey) && (key === 'a' || key === 'c')) {
          e.preventDefault();
        }
      });

      // Disable right-click copy menu
      this.editorInstance.onContextMenu((e: any) => {
        e.event.preventDefault();
      });

      // Clear selection on blur
      this.editorInstance.onDidBlurEditorText(() => {
        this.editorInstance.setSelection(null);
      });
    });
  } else {
    console.error('RequireJS is not loaded. Make sure loader.js is properly linked.');
  }
}

}
