import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartDropdownComponent } from './smart-dropdown.component';

describe('SmartDropdownComponent', () => {
  let component: SmartDropdownComponent;
  let fixture: ComponentFixture<SmartDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
