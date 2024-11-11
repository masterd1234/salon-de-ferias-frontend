import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorUsersComponent } from './visitor-users.component';

describe('VisitorUsersComponent', () => {
  let component: VisitorUsersComponent;
  let fixture: ComponentFixture<VisitorUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisitorUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
