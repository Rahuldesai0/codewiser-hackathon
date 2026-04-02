truncate table session_answers restart identity cascade;
truncate table session_batches restart identity cascade;
truncate table quiz_sessions restart identity cascade;
truncate table app_users restart identity cascade;
truncate table questions restart identity cascade;

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'OS',
    'Process Management',
    'Scheduling',
    'mcq',
    'Which scheduling algorithm can cause starvation for long CPU-bound jobs if short jobs keep arriving?',
    '[{"id":"a","text":"Round Robin","isCorrect":false},{"id":"b","text":"First Come First Serve","isCorrect":false},{"id":"c","text":"Shortest Job First","isCorrect":true},{"id":"d","text":"Rate Monotonic","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Shortest Job First favors shorter jobs, so long jobs may wait indefinitely in a busy system.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Scheduling',
    'short_text',
    'Name the scheduling metric defined as completion time minus arrival time.',
    '[]'::jsonb,
    '["turnaround time","turnaround"]'::jsonb,
    'Turnaround time measures total time spent in the system from arrival to completion.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Scheduling',
    'mcq',
    'In Round Robin scheduling, what does decreasing the time quantum too much usually increase?',
    '[{"id":"a","text":"Context switching overhead","isCorrect":true},{"id":"b","text":"CPU burst length","isCorrect":false},{"id":"c","text":"Mutual exclusion","isCorrect":false},{"id":"d","text":"Page size","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Very small quanta make the CPU switch between processes more often, increasing overhead.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Deadlocks',
    'mcq',
    'Which Coffman condition says a process holding resources can request additional resources?',
    '[{"id":"a","text":"Mutual exclusion","isCorrect":false},{"id":"b","text":"Hold and wait","isCorrect":true},{"id":"c","text":"No preemption","isCorrect":false},{"id":"d","text":"Circular wait","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Hold and wait means a process keeps what it has while waiting for more resources.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Deadlocks',
    'short_text',
    'What directed graph is commonly used to model a deadlock when each resource type has a single instance?',
    '[]'::jsonb,
    '["resource allocation graph","rag"]'::jsonb,
    'A resource allocation graph shows processes, resources, and request or assignment edges.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Deadlocks',
    'mcq',
    'Banker''s algorithm is mainly used for deadlock what?',
    '[{"id":"a","text":"Recovery","isCorrect":false},{"id":"b","text":"Avoidance","isCorrect":true},{"id":"c","text":"Detection","isCorrect":false},{"id":"d","text":"Ignorance","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Banker''s algorithm checks whether granting a request keeps the system in a safe state.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Memory Management',
    'Paging',
    'mcq',
    'What is the main purpose of a page table in a paging system?',
    '[{"id":"a","text":"Translate logical pages to physical frames","isCorrect":true},{"id":"b","text":"Store process priorities","isCorrect":false},{"id":"c","text":"Track CPU bursts","isCorrect":false},{"id":"d","text":"Encrypt memory contents","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'The page table maps a process logical address space onto physical memory frames.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Memory Management',
    'Paging',
    'short_text',
    'If a required page is not in main memory, the event is called a what?',
    '[]'::jsonb,
    '["page fault"]'::jsonb,
    'A page fault occurs when the processor references a page that must be fetched from secondary storage.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Memory Management',
    'Paging',
    'mcq',
    'Belady''s anomaly is associated with which page replacement algorithm?',
    '[{"id":"a","text":"LRU","isCorrect":false},{"id":"b","text":"FIFO","isCorrect":true},{"id":"c","text":"Optimal","isCorrect":false},{"id":"d","text":"Clock","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'FIFO can oddly produce more page faults when the number of frames increases.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Synchronization',
    'Semaphores',
    'mcq',
    'Which semaphore operation is usually used to release a resource?',
    '[{"id":"a","text":"wait","isCorrect":false},{"id":"b","text":"signal","isCorrect":true},{"id":"c","text":"sleep","isCorrect":false},{"id":"d","text":"yield","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'The signal or V operation increments the semaphore and may wake a waiting process.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Synchronization',
    'Semaphores',
    'short_text',
    'What property ensures that only one process enters the critical section at a time?',
    '[]'::jsonb,
    '["mutual exclusion"]'::jsonb,
    'Mutual exclusion guarantees exclusive access to the critical section.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Synchronization',
    'Semaphores',
    'mcq',
    'A binary semaphore can take how many distinct values?',
    '[{"id":"a","text":"1","isCorrect":false},{"id":"b","text":"2","isCorrect":true},{"id":"c","text":"3","isCorrect":false},{"id":"d","text":"Infinite","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'A binary semaphore uses only 0 and 1 to indicate availability.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Scheduling',
    'mcq',
    'Which scheduling policy assigns CPU time to each process in circular order with a fixed time quantum?',
    '[{"id":"a","text":"Shortest Remaining Time First","isCorrect":false},{"id":"b","text":"Round Robin","isCorrect":true},{"id":"c","text":"Priority Scheduling","isCorrect":false},{"id":"d","text":"Multilevel Feedback Queue","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Round Robin rotates among ready processes, giving each one a fixed quantum.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Deadlocks',
    'mcq',
    'A system state where deadlock can still be avoided if resources are allocated carefully is called what?',
    '[{"id":"a","text":"Unsafe state","isCorrect":false},{"id":"b","text":"Safe state","isCorrect":true},{"id":"c","text":"Critical state","isCorrect":false},{"id":"d","text":"Race state","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'A safe state has at least one safe sequence that allows every process to finish.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Memory Management',
    'Paging',
    'short_text',
    'What page replacement algorithm replaces the page that will not be used for the longest time in the future?',
    '[]'::jsonb,
    '["optimal","optimal page replacement","opt"]'::jsonb,
    'The optimal page replacement algorithm uses future knowledge and is mainly a theoretical benchmark.',
    '{}'::jsonb
  );

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'DBMS',
    'Relational Model',
    'Normalization',
    'mcq',
    'Which normal form removes partial dependency on a composite key?',
    '[{"id":"a","text":"1NF","isCorrect":false},{"id":"b","text":"2NF","isCorrect":true},{"id":"c","text":"3NF","isCorrect":false},{"id":"d","text":"BCNF","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Second Normal Form eliminates partial dependencies on candidate keys.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Relational Model',
    'Normalization',
    'short_text',
    'The process of reducing redundancy by decomposing tables is called what?',
    '[]'::jsonb,
    '["normalization"]'::jsonb,
    'Normalization organizes attributes and relations to reduce anomalies and redundancy.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Relational Model',
    'Normalization',
    'mcq',
    'A relation is in BCNF if for every non-trivial functional dependency X -> Y, X is a what?',
    '[{"id":"a","text":"Prime attribute","isCorrect":false},{"id":"b","text":"Superkey","isCorrect":true},{"id":"c","text":"Foreign key","isCorrect":false},{"id":"d","text":"Minimal cover","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'BCNF requires the determinant in every non-trivial functional dependency to be a superkey.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Transaction Management',
    'ACID',
    'mcq',
    'Which ACID property ensures that a transaction''s effects are permanent after commit?',
    '[{"id":"a","text":"Atomicity","isCorrect":false},{"id":"b","text":"Consistency","isCorrect":false},{"id":"c","text":"Isolation","isCorrect":false},{"id":"d","text":"Durability","isCorrect":true}]'::jsonb,
    '[]'::jsonb,
    'Durability ensures committed changes survive crashes and power loss.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Transaction Management',
    'ACID',
    'short_text',
    'What ACID property guarantees that either all operations of a transaction happen or none do?',
    '[]'::jsonb,
    '["atomicity"]'::jsonb,
    'Atomicity treats the transaction as an indivisible unit.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Transaction Management',
    'ACID',
    'mcq',
    'Dirty reads become possible when which isolation problem is present?',
    '[{"id":"a","text":"Reading uncommitted data","isCorrect":true},{"id":"b","text":"Lost update","isCorrect":false},{"id":"c","text":"Phantom read","isCorrect":false},{"id":"d","text":"Write skew","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'A dirty read means one transaction reads another transaction''s uncommitted data.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Indexing',
    'B+ Trees',
    'mcq',
    'In a B+ tree, actual record pointers are typically stored in which nodes?',
    '[{"id":"a","text":"Only internal nodes","isCorrect":false},{"id":"b","text":"Only leaf nodes","isCorrect":true},{"id":"c","text":"Root node only","isCorrect":false},{"id":"d","text":"All nodes equally","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'B+ trees keep search keys in internal nodes and record pointers at the leaves.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Indexing',
    'B+ Trees',
    'short_text',
    'What linked structure between leaf nodes makes range queries efficient in a B+ tree?',
    '[]'::jsonb,
    '["leaf level linked list","linked list","linked leaves"]'::jsonb,
    'Leaf nodes are linked in order, allowing fast sequential traversal for ranges.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Indexing',
    'B+ Trees',
    'mcq',
    'Increasing the branching factor of a balanced tree index usually does what to its height?',
    '[{"id":"a","text":"Increases height","isCorrect":false},{"id":"b","text":"Decreases height","isCorrect":true},{"id":"c","text":"Makes height random","isCorrect":false},{"id":"d","text":"Has no effect","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Higher branching factors let more keys fit per node, reducing the number of levels.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Concurrency Control',
    'Locking',
    'mcq',
    'Which lock allows multiple transactions to read the same item simultaneously?',
    '[{"id":"a","text":"Exclusive lock","isCorrect":false},{"id":"b","text":"Shared lock","isCorrect":true},{"id":"c","text":"Intent exclusive lock","isCorrect":false},{"id":"d","text":"Update lock","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Shared locks permit concurrent reads but block conflicting writes.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Concurrency Control',
    'Locking',
    'short_text',
    'Which protocol guarantees conflict serializability by requiring growing and shrinking phases?',
    '[]'::jsonb,
    '["two phase locking","2pl"]'::jsonb,
    'Two-phase locking separates lock acquisition from lock release.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Concurrency Control',
    'Locking',
    'mcq',
    'Strict two-phase locking mainly helps prevent which issue after a crash?',
    '[{"id":"a","text":"Cascading rollback","isCorrect":true},{"id":"b","text":"Full table scan","isCorrect":false},{"id":"c","text":"Duplicate indexes","isCorrect":false},{"id":"d","text":"Checkpointing","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'By holding exclusive locks until commit or abort, strict 2PL avoids cascading rollbacks.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Relational Model',
    'Normalization',
    'mcq',
    'Which normal form removes transitive dependency among non-key attributes?',
    '[{"id":"a","text":"2NF","isCorrect":false},{"id":"b","text":"3NF","isCorrect":true},{"id":"c","text":"BCNF","isCorrect":false},{"id":"d","text":"4NF","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Third Normal Form removes transitive dependencies on non-key attributes.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Transaction Management',
    'ACID',
    'short_text',
    'What isolation anomaly occurs when a transaction reads a row twice and gets different values because another transaction committed an update in between?',
    '[]'::jsonb,
    '["non repeatable read","nonrepeatable read"]'::jsonb,
    'A non-repeatable read happens when the same row returns different committed values within one transaction.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Indexing',
    'B+ Trees',
    'mcq',
    'Why are B+ trees widely used in databases instead of simple binary search trees?',
    '[{"id":"a","text":"They reduce disk I/O by keeping tree height small","isCorrect":true},{"id":"b","text":"They remove the need for indexes entirely","isCorrect":false},{"id":"c","text":"They never need rebalancing","isCorrect":false},{"id":"d","text":"They store only one key per node","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'B+ trees have high fan-out, which keeps the tree shallow and disk access efficient.',
    '{}'::jsonb
  );

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'DSA',
    'Trees',
    'Binary Search Tree',
    'mcq',
    'In a binary search tree, where are keys smaller than a node''s key stored?',
    '[{"id":"a","text":"Left subtree","isCorrect":true},{"id":"b","text":"Right subtree","isCorrect":false},{"id":"c","text":"Only at leaves","isCorrect":false},{"id":"d","text":"In hash buckets","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'BST ordering places smaller keys in the left subtree and larger keys in the right subtree.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Trees',
    'Binary Search Tree',
    'short_text',
    'What traversal of a binary search tree prints the keys in sorted order?',
    '[]'::jsonb,
    '["inorder","inorder traversal"]'::jsonb,
    'An inorder traversal visits left subtree, root, and right subtree in sorted order for a BST.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Trees',
    'Binary Search Tree',
    'mcq',
    'If a binary search tree becomes skewed, the worst-case search complexity becomes what?',
    '[{"id":"a","text":"O(1)","isCorrect":false},{"id":"b","text":"O(log n)","isCorrect":false},{"id":"c","text":"O(n)","isCorrect":true},{"id":"d","text":"O(n log n)","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'A skewed BST behaves like a linked list, making search linear in the number of nodes.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Sorting',
    'Divide and Conquer',
    'mcq',
    'Which sorting algorithm has average-case time complexity O(n log n) and is stable in its standard linked-list-friendly form?',
    '[{"id":"a","text":"Selection sort","isCorrect":false},{"id":"b","text":"Merge sort","isCorrect":true},{"id":"c","text":"Bubble sort","isCorrect":false},{"id":"d","text":"Insertion sort","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Merge sort repeatedly divides and merges while preserving relative order of equal elements.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Sorting',
    'Divide and Conquer',
    'short_text',
    'What partition-based sorting algorithm chooses a pivot and recursively sorts two partitions?',
    '[]'::jsonb,
    '["quicksort","quick sort"]'::jsonb,
    'Quicksort partitions around a pivot, then recursively sorts the resulting segments.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Sorting',
    'Divide and Conquer',
    'mcq',
    'If quicksort repeatedly chooses the smallest element as pivot on an already sorted array, the worst-case time is what?',
    '[{"id":"a","text":"O(log n)","isCorrect":false},{"id":"b","text":"O(n)","isCorrect":false},{"id":"c","text":"O(n log n)","isCorrect":false},{"id":"d","text":"O(n^2)","isCorrect":true}]'::jsonb,
    '[]'::jsonb,
    'Bad pivots create highly unbalanced partitions, producing quadratic performance.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Graphs',
    'Traversal',
    'mcq',
    'Which graph traversal uses a queue in its standard implementation?',
    '[{"id":"a","text":"Depth First Search","isCorrect":false},{"id":"b","text":"Breadth First Search","isCorrect":true},{"id":"c","text":"Topological sort only","isCorrect":false},{"id":"d","text":"Union find","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Breadth First Search explores neighbors level by level using a queue.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Graphs',
    'Traversal',
    'short_text',
    'Which traversal is commonly used to detect cycles in an undirected graph by checking visited neighbors and parent links?',
    '[]'::jsonb,
    '["depth first search","dfs"]'::jsonb,
    'DFS naturally tracks recursion or stack paths, making cycle checks straightforward.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Graphs',
    'Traversal',
    'mcq',
    'For an unweighted graph, the shortest path from a source to all vertices is found by which traversal?',
    '[{"id":"a","text":"DFS","isCorrect":false},{"id":"b","text":"BFS","isCorrect":true},{"id":"c","text":"Prim","isCorrect":false},{"id":"d","text":"Kruskal","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'BFS reaches vertices in increasing number of edges from the source in an unweighted graph.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Heaps',
    'Priority Queue',
    'mcq',
    'A binary heap is typically used to implement which abstract data type efficiently?',
    '[{"id":"a","text":"Priority queue","isCorrect":true},{"id":"b","text":"Trie","isCorrect":false},{"id":"c","text":"Suffix array","isCorrect":false},{"id":"d","text":"Hash join","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Binary heaps support efficient insertion and extraction of the highest or lowest priority element.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Heaps',
    'Priority Queue',
    'short_text',
    'What is the time complexity of inserting an element into a binary heap in the worst case?',
    '[]'::jsonb,
    '["o(log n)","log n"]'::jsonb,
    'Insertion may bubble the new element up through the height of the heap.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Heaps',
    'Priority Queue',
    'mcq',
    'In a max heap, the value stored at every parent node is how related to its children?',
    '[{"id":"a","text":"Smaller than both children","isCorrect":false},{"id":"b","text":"Equal to the left child only","isCorrect":false},{"id":"c","text":"Greater than or equal to both children","isCorrect":true},{"id":"d","text":"Unrelated to its children","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'The heap property in a max heap keeps each parent at least as large as its children.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Trees',
    'Binary Search Tree',
    'short_text',
    'Which node in a binary search tree has no children?',
    '[]'::jsonb,
    '["leaf","leaf node"]'::jsonb,
    'A leaf node is a node with no children.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Sorting',
    'Divide and Conquer',
    'mcq',
    'Merge sort follows which general design strategy?',
    '[{"id":"a","text":"Greedy","isCorrect":false},{"id":"b","text":"Dynamic programming","isCorrect":false},{"id":"c","text":"Divide and conquer","isCorrect":true},{"id":"d","text":"Backtracking","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Merge sort splits the array into smaller parts, solves them recursively, and combines the results.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Graphs',
    'Traversal',
    'short_text',
    'Which traversal explores graph vertices level by level?',
    '[]'::jsonb,
    '["breadth first search","bfs"]'::jsonb,
    'Breadth First Search processes vertices in increasing distance from the source.',
    '{}'::jsonb
  );

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'COA',
    'Processor Organization',
    'Pipelining',
    'mcq',
    'What is the main advantage of instruction pipelining?',
    '[{"id":"a","text":"It increases instruction throughput","isCorrect":true},{"id":"b","text":"It eliminates cache misses","isCorrect":false},{"id":"c","text":"It reduces program size","isCorrect":false},{"id":"d","text":"It removes the need for registers","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Pipelining overlaps instruction stages so more instructions complete per unit time.',
    '{}'::jsonb
  ),
  (
    'COA',
    'Processor Organization',
    'Pipelining',
    'short_text',
    'A data hazard in a pipeline is often reduced using what hardware technique that supplies results early to later stages?',
    '[]'::jsonb,
    '["forwarding","data forwarding","bypassing"]'::jsonb,
    'Forwarding, also called bypassing, routes produced values directly to dependent stages.',
    '{}'::jsonb
  ),
  (
    'COA',
    'Memory Organization',
    'Cache Memory',
    'mcq',
    'Which cache mapping technique allows a block to be placed in exactly one cache line?',
    '[{"id":"a","text":"Direct mapping","isCorrect":true},{"id":"b","text":"Fully associative mapping","isCorrect":false},{"id":"c","text":"Set associative mapping","isCorrect":false},{"id":"d","text":"Virtual mapping","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Direct-mapped cache chooses a single cache line for each memory block.',
    '{}'::jsonb
  ),
  (
    'COA',
    'Instruction Set Architecture',
    'Addressing Modes',
    'short_text',
    'In which addressing mode is the operand value itself present inside the instruction?',
    '[]'::jsonb,
    '["immediate addressing","immediate"]'::jsonb,
    'Immediate addressing embeds the operand directly in the instruction.',
    '{}'::jsonb
  ),
  (
    'COA',
    'Digital Logic',
    'Boolean Algebra',
    'mcq',
    'What is the output of an XOR gate when both inputs are the same?',
    '[{"id":"a","text":"0","isCorrect":true},{"id":"b","text":"1","isCorrect":false},{"id":"c","text":"Depends on carry","isCorrect":false},{"id":"d","text":"Undefined","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'XOR outputs 1 only when its inputs differ.',
    '{}'::jsonb
  );

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'CN',
    'Network Layers',
    'OSI Model',
    'mcq',
    'Which OSI layer is responsible for routing packets between networks?',
    '[{"id":"a","text":"Transport layer","isCorrect":false},{"id":"b","text":"Network layer","isCorrect":true},{"id":"c","text":"Session layer","isCorrect":false},{"id":"d","text":"Physical layer","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'The network layer handles logical addressing and routing.',
    '{}'::jsonb
  ),
  (
    'CN',
    'Transport Layer',
    'TCP',
    'short_text',
    'TCP uses which acknowledgement strategy where the receiver may confirm multiple bytes with one ACK number?',
    '[]'::jsonb,
    '["cumulative acknowledgement","cumulative ack","cumulative acknowledgment"]'::jsonb,
    'TCP acknowledgements are cumulative by default.',
    '{}'::jsonb
  ),
  (
    'CN',
    'Network Layer',
    'Routing',
    'mcq',
    'Which shortest-path algorithm is used by link-state routing protocols such as OSPF?',
    '[{"id":"a","text":"Bellman-Ford","isCorrect":false},{"id":"b","text":"Dijkstra","isCorrect":true},{"id":"c","text":"Floyd-Warshall","isCorrect":false},{"id":"d","text":"Kruskal","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Link-state protocols build a graph and use Dijkstra''s algorithm.',
    '{}'::jsonb
  ),
  (
    'CN',
    'Application Layer',
    'DNS and HTTP',
    'short_text',
    'DNS primarily translates domain names into what kind of address?',
    '[]'::jsonb,
    '["ip address","ip addresses","internet protocol address"]'::jsonb,
    'DNS resolves human-readable names to IP addresses.',
    '{}'::jsonb
  ),
  (
    'CN',
    'Transport Layer',
    'TCP',
    'mcq',
    'Which TCP flag is commonly used to initiate a connection?',
    '[{"id":"a","text":"FIN","isCorrect":false},{"id":"b","text":"RST","isCorrect":false},{"id":"c","text":"SYN","isCorrect":true},{"id":"d","text":"PSH","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'The SYN flag starts the TCP three-way handshake.',
    '{}'::jsonb
  );

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'Maths',
    'Discrete Mathematics',
    'Logic',
    'mcq',
    'The implication p -> q is false in which case?',
    '[{"id":"a","text":"p is true and q is false","isCorrect":true},{"id":"b","text":"p is false and q is true","isCorrect":false},{"id":"c","text":"Both are true","isCorrect":false},{"id":"d","text":"Both are false","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'An implication fails only when the premise is true and the conclusion is false.',
    '{}'::jsonb
  ),
  (
    'Maths',
    'Discrete Mathematics',
    'Relations and Functions',
    'short_text',
    'A function that is both one-to-one and onto is called what?',
    '[]'::jsonb,
    '["bijection","bijective function","bijective"]'::jsonb,
    'A function that is injective and surjective is bijective.',
    '{}'::jsonb
  ),
  (
    'Maths',
    'Combinatorics',
    'Counting',
    'mcq',
    'How many ways can 3 distinct books be arranged on a shelf?',
    '[{"id":"a","text":"3","isCorrect":false},{"id":"b","text":"6","isCorrect":true},{"id":"c","text":"9","isCorrect":false},{"id":"d","text":"27","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'The number of permutations of 3 distinct objects is 3! = 6.',
    '{}'::jsonb
  ),
  (
    'Maths',
    'Graph Theory',
    'Trees and Connectivity',
    'short_text',
    'A connected acyclic undirected graph is called what?',
    '[]'::jsonb,
    '["tree"]'::jsonb,
    'A tree is exactly a connected acyclic undirected graph.',
    '{}'::jsonb
  ),
  (
    'Maths',
    'Discrete Mathematics',
    'Logic',
    'mcq',
    'What is the logical negation of "p and q"?',
    '[{"id":"a","text":"not p and not q","isCorrect":false},{"id":"b","text":"not p or not q","isCorrect":true},{"id":"c","text":"p or q","isCorrect":false},{"id":"d","text":"not (p or q)","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'By De Morgan''s law, not(p and q) is equivalent to (not p) or (not q).',
    '{}'::jsonb
  );

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'TOC',
    'Formal Languages',
    'Regular Languages',
    'mcq',
    'Which machine recognizes regular languages?',
    '[{"id":"a","text":"Finite automaton","isCorrect":true},{"id":"b","text":"Pushdown automaton","isCorrect":false},{"id":"c","text":"Turing machine only","isCorrect":false},{"id":"d","text":"Linear bounded automaton","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Regular languages are recognized by finite automata.',
    '{}'::jsonb
  ),
  (
    'TOC',
    'Automata',
    'Pushdown Automata',
    'short_text',
    'A pushdown automaton uses which extra memory structure beyond finite-state control?',
    '[]'::jsonb,
    '["stack"]'::jsonb,
    'A PDA extends finite automata with a stack.',
    '{}'::jsonb
  ),
  (
    'TOC',
    'Computability',
    'Turing Machines',
    'mcq',
    'Which famous undecidable problem asks whether a program stops on a given input?',
    '[{"id":"a","text":"Travelling salesman problem","isCorrect":false},{"id":"b","text":"Halting problem","isCorrect":true},{"id":"c","text":"Membership problem for DFA","isCorrect":false},{"id":"d","text":"Sorting problem","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'The halting problem is undecidable for general programs and inputs.',
    '{}'::jsonb
  ),
  (
    'TOC',
    'Grammar',
    'Context Free Grammar',
    'short_text',
    'A grammar is called ambiguous if a string has more than one what?',
    '[]'::jsonb,
    '["parse tree","leftmost derivation","rightmost derivation"]'::jsonb,
    'Ambiguity means at least one string has multiple parse trees or equivalent derivations.',
    '{}'::jsonb
  ),
  (
    'TOC',
    'Formal Languages',
    'Regular Languages',
    'mcq',
    'Which operation can be used to convert an NFA into an equivalent DFA?',
    '[{"id":"a","text":"Subset construction","isCorrect":true},{"id":"b","text":"Topological sort","isCorrect":false},{"id":"c","text":"Dynamic programming","isCorrect":false},{"id":"d","text":"Backtracking","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Subset construction builds DFA states from sets of NFA states.',
    '{}'::jsonb
  );

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'Miscellaneous CS',
    'Programming Languages',
    'Language Concepts',
    'mcq',
    'What is the main job of a compiler?',
    '[{"id":"a","text":"Translate source code into target code","isCorrect":true},{"id":"b","text":"Route packets","isCorrect":false},{"id":"c","text":"Schedule processes","isCorrect":false},{"id":"d","text":"Normalize relations","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'A compiler translates a high-level program into lower-level target code.',
    '{}'::jsonb
  ),
  (
    'Miscellaneous CS',
    'Software Engineering',
    'Testing and Design',
    'short_text',
    'Testing individual functions or classes in isolation is usually called what kind of testing?',
    '[]'::jsonb,
    '["unit testing","unit test"]'::jsonb,
    'Unit testing verifies small isolated units of code.',
    '{}'::jsonb
  ),
  (
    'Miscellaneous CS',
    'Security',
    'Basics',
    'mcq',
    'Which property ensures that data has not been altered unexpectedly?',
    '[{"id":"a","text":"Confidentiality","isCorrect":false},{"id":"b","text":"Availability","isCorrect":false},{"id":"c","text":"Integrity","isCorrect":true},{"id":"d","text":"Latency","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Integrity means the data remains accurate and unmodified.',
    '{}'::jsonb
  ),
  (
    'Miscellaneous CS',
    'Algorithms and Analysis',
    'Asymptotics',
    'short_text',
    'Which notation gives an asymptotic upper bound on growth rate?',
    '[]'::jsonb,
    '["big o","o notation","big o notation"]'::jsonb,
    'Big-O notation describes an asymptotic upper bound.',
    '{}'::jsonb
  ),
  (
    'Miscellaneous CS',
    'Security',
    'Basics',
    'mcq',
    'Which cryptographic technique uses the same secret key for encryption and decryption?',
    '[{"id":"a","text":"Asymmetric encryption","isCorrect":false},{"id":"b","text":"Symmetric encryption","isCorrect":true},{"id":"c","text":"Hashing","isCorrect":false},{"id":"d","text":"Digital signature","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Symmetric encryption uses one shared secret key at both ends.',
    '{}'::jsonb
  );
