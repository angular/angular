export interface Category {
  id: string;    // "education"
  title: string; // "Education"
  order: number; // 2
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;    // "books"
  title: string; // "Books"
  order: number; // 1
  resources: Resource[];
}

export interface Resource {
  category: string;    // "Education"
  subCategory: string; // "Books"
  id: string;          // "-KLI8vJ0ZkvWhqPembZ7"
  desc: string;        // "This books shows all the steps necessary for the development of SPA"
  title: string;       // "Practical Angular 2",
  url: string;         // "https://leanpub.com/practical-angular-2"
}
