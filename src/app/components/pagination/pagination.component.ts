import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  visiblePages: number[] = [];
  private startEllipsis: boolean = false;
  private endEllipsis: boolean = false;
  showingStartInput: boolean = false;
  showingEndInput: boolean = false;
  pageInput: number | null = null;

  ngOnChanges(): void {
    this.calculateVisiblePages();
  }

  get showStartEllipsis(): boolean {
    return this.startEllipsis && Math.min(...this.visiblePages) > 2;
  }

  get showEndEllipsis(): boolean {
    return this.endEllipsis && Math.max(...this.visiblePages) < this.totalPages - 1;
  }

  calculateVisiblePages(): void {
    const pages: number[] = [];
    const totalVisiblePages = 5;
    
    if (this.totalPages <= totalVisiblePages + 2) {
      for (let i = 2; i < this.totalPages; i++) {
        pages.push(i);
      }
      this.startEllipsis = false;
      this.endEllipsis = false;
    } else {
      let start: number;
      let end: number;

      if (this.currentPage <= 3) {
        start = 2;
        end = 6;
        this.startEllipsis = false;
        this.endEllipsis = true;
      } else if (this.currentPage >= this.totalPages - 2) {
        start = this.totalPages - 5;
        end = this.totalPages - 1;
        this.startEllipsis = true;
        this.endEllipsis = false;
      } else {
        start = this.currentPage - 2;
        end = this.currentPage + 2;
        this.startEllipsis = true;
        this.endEllipsis = true;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    this.visiblePages = pages;
  }

  toggleStartInput(): void {
    this.showingStartInput = true;
    this.showingEndInput = false;
    this.pageInput = null;
    setTimeout(() => {
      const input = document.querySelector('.page-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    });
  }

  toggleEndInput(): void {
    this.showingEndInput = true;
    this.showingStartInput = false;
    this.pageInput = null;
    setTimeout(() => {
      const input = document.querySelector('.page-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    });
  }

  goToPage(): void {
    if (this.pageInput && this.pageInput >= 1 && this.pageInput <= this.totalPages && this.pageInput !== this.currentPage) {
      this.onPageChange(this.pageInput);
      this.showingStartInput = false;
      this.showingEndInput = false;
      this.pageInput = null;
    }
  }

  onInputBlur(): void {
    setTimeout(() => {
      this.showingStartInput = false;
      this.showingEndInput = false;
      this.pageInput = null;
    }, 200);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
