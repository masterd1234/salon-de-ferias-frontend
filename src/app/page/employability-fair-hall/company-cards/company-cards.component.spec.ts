import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyCardsComponent } from './company-cards.component';

describe('CompanyCardsComponent', () => {
  let component: CompanyCardsComponent;
  let fixture: ComponentFixture<CompanyCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyCardsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanyCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
