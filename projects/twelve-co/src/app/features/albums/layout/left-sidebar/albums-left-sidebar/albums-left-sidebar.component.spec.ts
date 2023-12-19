import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumsLeftSidebarComponent } from './albums-left-sidebar.component';

describe('AlbumsLeftSidebarComponent', () => {
  let component: AlbumsLeftSidebarComponent;
  let fixture: ComponentFixture<AlbumsLeftSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlbumsLeftSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlbumsLeftSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
