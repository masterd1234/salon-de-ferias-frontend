import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-banner-root',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDividerModule, ReactiveFormsModule, MatCardModule, MatSliderModule, MatFormFieldModule]
})
export class BannerComponent implements OnInit {
  @Input() canUploadFiles: boolean = false;
  formBanner!: FormGroup;
  bannerUrl: string | null = null;
  posterUrl: string | null = null;
  logoUrl: string | null = null;
  logoTransform: string = 'scale(1)';
  zoom: number = 1;
  logoPosition = { x: 0, y: 0 };
  isSmallScreen: boolean = false;
  isContentVisible: boolean = false;
  logoFileName: string = '';
  bannerFileName: string = '';
  posterFileName: string = '';

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver
  ) { 
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      this.isSmallScreen = result.matches;
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.formBanner = this.fb.group({
      logo: ['', Validators.required],
      banner: [''],
      poster: ['']
    });
  }

  toggleContentVisibility() {
    this.isContentVisible = !this.isContentVisible;
  }

  onFileChange(event: Event, type: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.type !== 'image/png') {
        alert("Por favor sube solo archivos en formato PNG.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo no debe superar los 5 MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'banner') {
          this.bannerUrl = result;
          this.bannerFileName = file.name;
        } else if (type === 'poster') {
          this.posterUrl = result;
          this.posterFileName = file.name;
        } else if (type === 'logo') {
          this.logoUrl = result;
          this.logoFileName = file.name;
        }
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.formBanner.valid) {
      console.log("Formulario enviado:", this.formBanner.value);
      this.formBanner.reset();
      this.bannerUrl = null;
      this.posterUrl = null;
      this.logoUrl = null;
      this.logoFileName = '';
      this.bannerFileName = '';
      this.posterFileName = '';
    }
  }

  onZoom(event: WheelEvent) {
    event.preventDefault();
    const zoomFactor = 0.05;
    this.zoom += event.deltaY > 0 ? -zoomFactor : zoomFactor;
    this.zoom = Math.min(Math.max(0.5, this.zoom), 2);
    this.logoTransform = `scale(${this.zoom})`;
  }

  startDragging(event: MouseEvent) {
    const initialX = event.clientX - this.logoPosition.x;
    const initialY = event.clientY - this.logoPosition.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      this.logoPosition.x = moveEvent.clientX - initialX;
      this.logoPosition.y = moveEvent.clientY - initialY;
      this.logoTransform = `translate(${this.logoPosition.x}px, ${this.logoPosition.y}px) scale(${this.zoom})`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
