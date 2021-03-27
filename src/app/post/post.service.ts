import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Post } from './post.model';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: number}>();

  constructor(private httpClient: HttpClient,
              private router: Router) { }

  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.httpClient.get<{ message: string, posts: any[]; maxPosts: number }>(`http://localhost:3000/api/posts${queryParams}`)
      .pipe(
        (map((postData) => {
          return {
            posts: postData.posts.map(post => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
              }
            }),
            maxPosts: postData.maxPosts
          };
        }))
      )
      .subscribe((transformedPostsData) => {
        console.log(transformedPostsData);
        this.posts = transformedPostsData.posts;
        this.postsUpdated.next({ posts: [...this.posts], postCount: transformedPostsData.maxPosts });
      });
  }

  getPostUpdateListener(): Observable<{ posts: Post[], postCount: number }> {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string): Observable<{ _id: string; title: string; content: string, imagePath: string, creator: string }> {
    return this.httpClient.get<{ _id: string; title: string; content: string, imagePath: string, creator: string }>('http://localhost:3000/api/posts/' + id);
  }

  addPost(title: string, content: string, image: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.httpClient.post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData)
    .subscribe(_ => this.router.navigate(['/']));
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image
      }
    }

    this.httpClient.put('http://localhost:3000/api/posts/' + id, postData)
    .subscribe(_ => this.router.navigate(['/']));
  }

  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete('http://localhost:3000/api/posts/' + postId);
  }
}
