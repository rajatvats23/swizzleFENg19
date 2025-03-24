import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ProductService } from './product.service';
import { CategoryService } from '../category/category.service';
import { TagService } from '../tag/tag.service';
import { AddonService } from '../addons/addon.service';
import { Addon } from '../addons/models/addon.model';
import { ProductAddon } from './product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="top-label">{{ isEditMode ? 'Edit' : 'Create' }} Product</span>
        <button mat-button color="primary" routerLink="/dashboard/products">
          <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
        </button>
      </div>

      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Basic Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Product Name</mat-label>
                <input matInput formControlName="name" placeholder="Enter product name">
                <mat-error *ngIf="productForm.get('name')?.hasError('required')">Name is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" placeholder="Enter product description" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Price</mat-label>
                <input matInput formControlName="price" type="number" min="0" step="0.01" placeholder="Enter price">
                <span matTextSuffix>$</span>
                <mat-error *ngIf="productForm.get('price')?.hasError('required')">Price is required</mat-error>
                <mat-error *ngIf="productForm.get('price')?.hasError('min')">Price cannot be negative</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option *ngFor="let category of categories" [value]="category._id">
                    {{category.name}}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="productForm.get('category')?.hasError('required')">Category is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tags</mat-label>
                <mat-chip-grid #chipGrid aria-label="Tag selection">
                  <mat-chip-row
                    *ngFor="let tag of selectedTags"
                    (removed)="removeTag(tag)"
                  >
                    {{tag.name}}
                    <button matChipRemove [attr.aria-label]="'remove ' + tag.name">
                      <mat-icon class="material-symbols-outlined">cancel</mat-icon>
                    </button>
                  </mat-chip-row>
                  <input
                    placeholder="New tag..."
                    #tagInput
                    [formControl]="tagCtrl"
                    [matChipInputFor]="chipGrid"
                    [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                    (matChipInputTokenEnd)="addTag($event)"
                    [matAutocomplete]="auto"
                  />
                </mat-chip-grid>
                <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selected($event)">
                  <mat-option *ngFor="let tag of filteredTags | async" [value]="tag">
                    {{tag.name}}
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>

              <div class="form-row">
                <mat-slide-toggle formControlName="isAvailable" color="primary">
                  Available for Sale
                </mat-slide-toggle>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Product Image</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="image-upload-container">
                <div class="image-preview" *ngIf="previewUrl || productForm.get('imageUrl')?.value">
                  <img [src]="previewUrl || productForm.get('imageUrl')?.value" alt="Product preview">
                </div>
                <div class="image-placeholder" *ngIf="!previewUrl && !productForm.get('imageUrl')?.value">
                  <mat-icon class="material-symbols-outlined">image</mat-icon>
                  <p>No image selected</p>
                </div>
                <div class="upload-actions">
                  <button mat-raised-button type="button" (click)="fileInput.click()">
                    <mat-icon class="material-symbols-outlined">upload</mat-icon> Upload Image
                  </button>
                  <input #fileInput type="file" accept="image/*" style="display: none" (change)="onFileSelected($event)">
                  <button mat-button type="button" color="warn" *ngIf="previewUrl || productForm.get('imageUrl')?.value" (click)="clearImage()">
                    <mat-icon class="material-symbols-outlined">delete</mat-icon> Remove
                  </button>
                </div>
              </div>
              <p class="upload-hint">Recommended size: 500x500 pixels, max 5MB</p>
              <div class="addons-section" *ngIf="addons.length > 0">
  <h3>Addons</h3>
  
  <div formArrayName="addons" class="addons-list">
    <div *ngFor="let addonControl of addonsArray.controls; let i = index" [formGroupName]="i" class="addon-item">
      <mat-form-field appearance="outline">
        <mat-label>Addon</mat-label>
        <mat-select formControlName="addon">
          <mat-option *ngFor="let addon of addons" [value]="addon._id">
            {{addon.name}} ({{addon.isMultiSelect ? 'Multiple' : 'Single'}} select)
          </mat-option>
        </mat-select>
      </mat-form-field>
      
      <mat-slide-toggle formControlName="required" color="primary">
        Required
      </mat-slide-toggle>
      
      <button mat-icon-button color="warn" type="button" (click)="removeAddon(i)" aria-label="Remove addon">
        <mat-icon class="material-symbols-outlined">delete</mat-icon>
      </button>
    </div>
    
    <button mat-raised-button color="primary" type="button" (click)="addAddon()" *ngIf="addons.length > 0">
      <mat-icon class="material-symbols-outlined">add</mat-icon> Add Addon
    </button>
  </div>
</div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="form-actions">
          <button mat-button type="button" routerLink="/dashboard/products">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid || isUploading || isSubmitting">
            <span *ngIf="isSubmitting">Saving...</span>
            <span *ngIf="!isSubmitting">{{ isEditMode ? 'Update' : 'Create' }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      width: 100%;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .form-card {
      height: 100%;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .form-row {
      margin-bottom: 16px;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .image-upload-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border: 2px dashed #ccc;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .image-preview {
      width: 200px;
      height: 200px;
      margin-bottom: 16px;
      border-radius: 4px;
      overflow: hidden;
    }
    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-placeholder {
      width: 200px;
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      margin-bottom: 16px;
      border-radius: 4px;
    }
    .image-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      color: #999;
    }
    .upload-actions {
      display: flex;
      gap: 10px;
    }
    .upload-hint {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    @media (max-width: 767px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }`]
})
export class ProductFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productService = inject(ProductService);
    private categoryService = inject(CategoryService);
    private tagService = inject(TagService);
    private snackBar = inject(MatSnackBar);
    private addonService = inject(AddonService);
    addons: Addon[] = [];
  
    @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  
    productForm!: FormGroup;
    isEditMode = false;
    isSubmitting = false;
    isUploading = false;
    productId = '';
    previewUrl: string | null = null;
    selectedFile: File | null = null;
  
    categories: any[] = [];
    allTags: any[] = [];
    selectedTags: any[] = [];
    separatorKeysCodes: number[] = [ENTER, COMMA];
    tagCtrl = new FormControl('');
    filteredTags: Observable<any[]> = new Observable<any[]>();
  
    ngOnInit(): void {
      this.initForm();
      this.loadAddons();
      this.loadCategories();
      this.loadTags();
      
      this.productId = this.route.snapshot.params['id'];
      this.isEditMode = !!this.productId;
      
      if (this.isEditMode) {
        this.loadProductData();
      }
  
      this.setupTagFilter();
    }
  
    initForm(): void {
      this.productForm = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        price: [0, [Validators.required, Validators.min(0)]],
        imageUrl: [''],
        category: ['', Validators.required],
        addons: this.fb.array([]), // Add this line
        isAvailable: [true]
      });
    }

    get addonsArray() {
      return this.productForm.get('addons') as FormArray;
    }
    
    createAddonForm(productAddon?: ProductAddon): FormGroup {
      return this.fb.group({
        addon: [productAddon?.addon || '', Validators.required],
        required: [productAddon?.required || false]
      });
    }

    loadAddons(): void {
      this.addonService.getAddons().subscribe({
        next: (response:any) => {
          this.addons = response.data.addons;
        },
        error: (error:any) => {
          console.error('Error loading addons:', error);
        }
      });
    } 
    
    addAddon(productAddon?: ProductAddon): void {
      this.addonsArray.push(this.createAddonForm(productAddon));
    }
    
    removeAddon(index: number): void {
      this.addonsArray.removeAt(index);
    }
    
  
    loadCategories(): void {
      this.categoryService.getCategories().subscribe({
        next: (response:any) => {
          this.categories = response.data.categories;
        },
        error: (error:any) => {
          console.error('Error loading categories:', error);
          this.snackBar.open(error.error?.message || 'Failed to load categories', 'Close', { duration: 5000 });
        }
      });
    }
  
    loadTags(): void {
      this.tagService.getTags().subscribe({
        next: (response:any) => {
          this.allTags = response.data.tags;
          this.setupTagFilter();
        },
        error: (error:any) => {
          console.error('Error loading tags:', error);
          this.snackBar.open(error.error?.message || 'Failed to load tags', 'Close', { duration: 5000 });
        }
      });
    }
  
    setupTagFilter(): void {
      this.filteredTags = this.tagCtrl.valueChanges.pipe(
        startWith(null as unknown as string),
        map((tagName: string | null) => {
          if (!tagName) {
            return this.allTags.filter(tag => 
              !this.selectedTags.some(selectedTag => selectedTag._id === tag._id)
            );
          }
          const filterValue = tagName.toLowerCase();
          return this.allTags.filter(tag => 
            tag.name.toLowerCase().includes(filterValue) && 
            !this.selectedTags.some(selectedTag => selectedTag._id === tag._id)
          );
        })
      );
    }
  
    loadProductData(): void {
      this.productService.getProductById(this.productId).subscribe({
        next: (response:any) => {
          const product = response.data.product;
          
          this.productForm.patchValue({
            name: product.name,
            description: product.description || '',
            price: product.price,
            imageUrl: product.imageUrl || '',
            category: product.category._id,
            isAvailable: product.isAvailable
          });

          if (product.addons && product.addons.length) {
            this.addonsArray.clear();

            product.addons.forEach((productAddon:any) => {
              this.addAddon(productAddon);
            });
          
          // Set selected tags
          if (product.tags && product.tags.length) {
            this.selectedTags = [...product.tags];
          }
        }
        },
        error: (error:any) => {
          this.snackBar.open(error.error?.message || 'Failed to load product', 'Close', { duration: 5000 });
          this.router.navigate(['/dashboard/products']);
        }
      });
    }
  
    addTag(event: any): void {
      const value = (event.value || '').trim();
      
      // Add tag only if it's not already selected
      if (value && !this.selectedTags.some(tag => tag.name.toLowerCase() === value.toLowerCase())) {
        // Check if tag exists
        const existingTag = this.allTags.find(tag => tag.name.toLowerCase() === value.toLowerCase());
        
        if (existingTag) {
          this.selectedTags.push(existingTag);
        } else {
          // Create a new tag object (will be created on the backend when saving the product)
          this.selectedTags.push({ name: value, isNew: true });
        }
      }
      
      // Reset the input value
      if (event.input) {
        event.input.value = '';
      }
      
      this.tagCtrl.setValue(null);
    }
  
    selected(event: MatAutocompleteSelectedEvent): void {
      this.selectedTags.push(event.option.value);
      this.tagInput.nativeElement.value = '';
      this.tagCtrl.setValue(null);
    }
  
    removeTag(tag: any): void {
      const index = this.selectedTags.indexOf(tag);
      
      if (index >= 0) {
        this.selectedTags.splice(index, 1);
      }
    }
  
    onFileSelected(event: any): void {
      const file = event.target.files[0];
      
      if (file) {
        // Check if file is an image
        if (!file.type.match(/image\/*/) || file?.type !== 'image/svg+xml') {
          this.snackBar.open('Only image files are allowed', 'Close', { duration: 3000 });
          return;
        }
        
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          this.snackBar.open('File size should not exceed 5MB', 'Close', { duration: 3000 });
          return;
        }
        
        this.selectedFile = file;
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  
    clearImage(): void {
      this.selectedFile = null;
      this.previewUrl = null;
      this.productForm.get('imageUrl')?.setValue('');
    }
  
    async uploadImage(): Promise<string | null> {
      if (!this.selectedFile) {
        return null;
      }
      
      this.isUploading = true;
      
      try {
        // Get presigned URL from backend
        const response = await this.productService.getUploadUrl(
          this.selectedFile.type, 
          this.selectedFile.name
        ).toPromise();
        
        const { uploadUrl, imageUrl } = response?.data || {};
        
        // Upload directly to S3
        if (uploadUrl) {
          await this.productService.uploadToS3(uploadUrl, this.selectedFile).toPromise();
        } else {
          throw new Error('Upload URL is undefined');
        }
        
        this.isUploading = false;
        return imageUrl || null;
      } catch (error:any) {
        this.isUploading = false;
        this.snackBar.open('Failed to upload image', 'Close', { duration: 5000 });
        console.error('Upload error:', error);
        return null;
      }
    }
  
    async onSubmit(): Promise<void> {
      if (this.productForm.invalid) {
        return;
      }
  
      this.isSubmitting = true;
      
      // Upload image if selected
      let imageUrl = this.productForm.value.imageUrl;
      if (this.selectedFile) {
        imageUrl = await this.uploadImage();
        if (!imageUrl && !this.productForm.value.imageUrl) {
          this.isSubmitting = false;
          return;
        }
      }
      
      // Prepare tag IDs for submission
      const tagIds = this.selectedTags.map(tag => tag._id || null).filter(id => id !== null);
      
      // Create or update product
      const productData = {
        ...this.productForm.value,
        imageUrl,
        tags: tagIds
      };
      
      if (this.isEditMode) {
        this.productService.updateProduct(this.productId, productData).subscribe({
          next: () => {
            this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard/products']);
          },
          error: (error:any) => {
            this.isSubmitting = false;
            this.snackBar.open(error.error?.message || 'Failed to update product', 'Close', { duration: 5000 });
          }
        });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: () => {
            this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard/products']);
          },
          error: (error:any) => {
            this.isSubmitting = false;
            this.snackBar.open(error.error?.message || 'Failed to create product', 'Close', { duration: 5000 });
          }
        });
      }
    }
  }