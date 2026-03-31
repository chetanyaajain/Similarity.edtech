# Database Schema

## Tables

### `users`
- `id` integer primary key
- `full_name` varchar(120)
- `email` varchar(255) unique
- `password_hash` varchar(255)
- `role` varchar(32)
- `preferred_language` varchar(8)
- `created_at` timestamp

### `batches`
- `id` integer primary key
- `name` varchar(120)
- `year` varchar(12)
- `subject` varchar(120)
- `section` varchar(16)
- `owner_id` foreign key -> `users.id`
- `created_at` timestamp

### `submissions`
- `id` integer primary key
- `batch_id` foreign key -> `batches.id`
- `student_name` varchar(120)
- `student_email` varchar(255) nullable
- `filename` varchar(255)
- `file_type` varchar(16)
- `version` integer
- `extracted_text` text
- `summary` text
- `keywords` json
- `originality_score` float
- `created_at` timestamp

### `similarity_edges`
- `id` integer primary key
- `source_submission_id` foreign key -> `submissions.id`
- `target_submission_id` foreign key -> `submissions.id`
- `similarity_percentage` float
- `tfidf_score` float
- `semantic_score` float
- `explanation` text
- `matched_segments` json
- `created_at` timestamp

### `reports`
- `id` integer primary key
- `batch_id` foreign key -> `batches.id`
- `generated_by_id` foreign key -> `users.id`
- `title` varchar(255)
- `report_payload` json
- `pdf_path` varchar(255) nullable
- `emailed` boolean
- `created_at` timestamp

## Notes

- `version` supports submission history per student inside a batch.
- `similarity_edges` stores pairwise comparisons so the frontend can render graphs, heatmaps, and detailed comparisons without recomputing.
- `report_payload` stores a snapshot of analytics for repeatable report views and chatbot explanations.

