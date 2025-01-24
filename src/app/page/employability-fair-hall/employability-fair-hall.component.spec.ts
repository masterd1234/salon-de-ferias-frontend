import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployabilityFairHallComponent } from './employability-fair-hall.component';

describe('EmployabilityFairHallComponent', () => {
  let component: EmployabilityFairHallComponent;
  let fixture: ComponentFixture<EmployabilityFairHallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployabilityFairHallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmployabilityFairHallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
