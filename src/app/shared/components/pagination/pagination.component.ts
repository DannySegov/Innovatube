import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  @Input({ required: true }) currentPage: number = 1;
  @Input({ required: true }) pageSize: number = 10;
  @Input({ required: true }) totalItems: number = 0;

  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();

  readonly Math = Math;

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const totalPages: number = this.totalPages;
    const currentPage: number = this.currentPage;
    const pageNumbers: number[] = [];

    // Always show first page
    pageNumbers.push(1);

    // Show pages around current page
    const startPage: number = Math.max(2, currentPage - 1);
    const endPage: number = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) {
      pageNumbers.push(-1); // Ellipsis
    }

    for (let i: number = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Show last page if not already included
    if (endPage < totalPages - 1) {
      pageNumbers.push(-1); // Ellipsis
    }
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  }
}
