export function GET_NODES_BY_PATH_QUERY(
	path: string,
	userId: string,
	{
		includeChildren = false,
		orderBy = ''
	}: Partial<{ includeChildren: boolean; orderBy: string }> = {}
) {
	const query = `
  WITH RECURSIVE
	  CTE AS (
	    SELECT
	      id,
	      name AS parent_path
	    FROM
	      nodes
	    WHERE
	      parentId IS NULL
	      AND userId = __userid
	    UNION ALL
	    SELECT
	      n.id,
	      parent_path || '/' || n.name
	    FROM
	      nodes n
	      JOIN CTE ON n.parentId = CTE.id
	  ) SELECT
				  *
				FROM
				  nodes
				WHERE
				  id = (
				    SELECT
				      id
				    FROM
				      CTE
				    WHERE
				      parent_path = __path 
				  ) __includeChildren
	`;

	path = path === '/' ? 'root' : 'root' + path;

	return query
		.replace(/__path/g, `'${path}'`)
		.replace(/__userid/g, `'${userId}'`)
		.replace(
			/__includeChildren/g,
			includeChildren ?
				`UNION ALL
				SELECT 
					* 
				FROM 
          (SELECT * FROM nodes __orderBy)
				WHERE 
					parentId = (
				    SELECT
				      id
				    FROM
				      CTE
				    WHERE
				      parent_path = __path 
				  )
					`
					.replace(/__path/g, `'${path}'`)
					.replace(/__orderBy/g, orderBy === '' ? '' : `ORDER BY ${orderBy}`)
			:	''
		);
}

export function GET_PATH_BY_NODE_ID_QUERY(id: string, userId: string): string {
	return `WITH RECURSIVE
        CTE AS (
          SELECT
            1 AS n,
            name,
            parentId,
            name AS path
          FROM
            nodes
          WHERE
            id = __id
            AND userId = __userid
          UNION ALL
          SELECT
            CTE.n + 1,
            n.name,
            n.parentId,
            n.name || '/' || CTE.path AS path
          FROM
            nodes n
            JOIN CTE ON n.id = CTE.parentId
          WHERE
            n.parentId IS NOT NULL
        )
      SELECT
        '/' || path AS path
      FROM CTE
      ORDER BY
        n DESC
      LIMIT
        1;`
		.replace(/__id/g, `'${id}'`)
		.replace(/__userid/g, `'${userId}'`);
}
