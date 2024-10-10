import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandDesingComponent } from './stand-desing.component';

describe('StandDesingComponent', () => {
  let component: StandDesingComponent;
  let fixture: ComponentFixture<StandDesingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandDesingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StandDesingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
