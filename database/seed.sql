USE llp_local;

INSERT INTO categories (name, slug, description, scope, status)
VALUES
('Web Development', 'web-development', 'Learn modern web development.', 'BOTH', 'ACTIVE'),
('GraphQL', 'graphql', 'Learn API development with GraphQL.', 'LECTURE', 'ACTIVE')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  scope = VALUES(scope),
  status = VALUES(status);

INSERT INTO category_outline_items (category_id, parent_id, title, sort_order)
VALUES
(1, NULL, 'Introduction', 1),
(1, NULL, 'Frontend Basics', 2),
(1, NULL, 'Backend Basics', 3),
(2, NULL, 'GraphQL Basics', 1),
(2, NULL, 'Queries and Mutations', 2);

INSERT INTO lectures (
  category_id,
  title,
  slug,
  description,
  content,
  status,
  reading_time,
  published_at
)
VALUES
(
  1,
  'Introduction to Web Development',
  'introduction-to-web-development',
  'First lecture about web development.',
  JSON_OBJECT('type', 'doc', 'content', JSON_ARRAY()),
  'PUBLISHED',
  '5 min',
  NOW()
),
(
  2,
  'Introduction to GraphQL',
  'introduction-to-graphql',
  'First lecture about GraphQL.',
  JSON_OBJECT('type', 'doc', 'content', JSON_ARRAY()),
  'PUBLISHED',
  '7 min',
  NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  title = VALUES(title),
  description = VALUES(description),
  content = VALUES(content),
  status = VALUES(status),
  reading_time = VALUES(reading_time),
  published_at = VALUES(published_at);

INSERT INTO lecture_outline_items (lecture_id, parent_id, title, sort_order)
VALUES
(1, NULL, 'What is web development?', 1),
(1, NULL, 'Frontend and backend', 2),
(2, NULL, 'What is GraphQL?', 1),
(2, NULL, 'GraphQL vs REST', 2);
