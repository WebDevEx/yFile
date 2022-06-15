/**
 * @license
 * This app exhibits yFiles for HTML functionalities.
 * Copyright (c) 2020 by yWorks GmbH, Vor dem Kreuzberg 28,
 * 72070 Tuebingen, Germany. All rights reserved.
 *
 * yFiles demo files exhibit yFiles for HTML functionalities.
 * Any redistribution of demo files in source code or binary form, with
 * or without modification, is not permitted.
 *
 * Owners of a valid software license for a yFiles for HTML
 * version are allowed to use the app source code as basis for their
 * own yFiles for HTML powered applications. Use of such programs is
 * governed by the rights and conditions as set out in the yFiles for HTML
 * license agreement. If in doubt, please mail to contact@yworks.com.
 *
 * THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {
  auth,
  driver,
  Integer,
  Node as Neo4jNode,
  Path,
  QueryResult,
  Relationship,
} from 'neo4j-driver'
/* @ts-ignore */
import { isNode, isPath, isRelationship } from 'neo4j-driver/lib/graph-types'
import { Parameters } from 'neo4j-driver/types/query-runner'

export type DBConnectionConfiguration = {
  url: string
  username: string
  password: string
  databaseName?: string
}

export type QueryConfiguration = {
  query: string
  loadRelations: boolean
}

function getId(identity: Integer) {
  return identity.toString(10)
}

export async function runCypherQuery(
  s: { parameters?: Parameters | undefined },
  configuration: DBConnectionConfiguration & QueryConfiguration
): Promise<{ nodes: Neo4jNode[]; relations: Relationship[]; data: any[] }> {
  // nothing configured - return an empty data set instead of erroring out
  if (!configuration.url) {
    return { nodes: [], relations: [], data: [] }
  }
  const runQuery = await connectToDB(configuration)

  const data = await runQuery(configuration.query, s.parameters)

  const nodes: Map<string, Neo4jNode> = new Map()
  const relations: Map<string, Relationship> = new Map()
  const missingNodeIds: Integer[] = []
  const dataItems: { [key: string]: any }[] = []
  collectResults(data, nodes, relations, missingNodeIds, dataItems)

  if (missingNodeIds.length > 0) {
    const missingNodes = (
      await runQuery(`MATCH (n) WHERE id(n) in $ids RETURN distinct(n)`, {
        ids: missingNodeIds,
      })
    ).records.map((r) => r.get(0) as Neo4jNode)
    missingNodes.forEach((node) => nodes.set(getId(node.identity), node))
  }

  if (configuration.loadRelations) {
    const missingRelations = (
      await runQuery(
        `MATCH (s)-[r]->(t) WHERE id(s) in $ids AND id(t) in $ids RETURN r`,
        {
          ids: Array.from(nodes.values()).map((value) => value.identity),
        }
      )
    ).records.map((value) => value.get('r') as Relationship)
    missingRelations.forEach((relation) =>
      relations.set(getId(relation.identity), relation)
    )
  }

  return {
    nodes: Array.from(nodes.values()).map((n) => ({
      ...n,
      id: getId(n.identity),
    })),
    relations: Array.from(relations.values()).map((r) => ({
      ...r,
      id: getId(r.identity),
      startId: getId(r.start),
      endId: getId(r.end),
    })),
    data: dataItems,
  }
}

function collectResults(
  result: QueryResult,
  nodes: Map<string, Neo4jNode>,
  relations: Map<string, Relationship>,
  missingNodeIds: Integer[],
  data: { [key: string]: any }[]
): void {
  const allMissingNodeIds: Integer[] = []
  result.records.forEach((record) => {
    const dataItem: { [key: string]: any } = {}
    for (let i = 0, l = record.length; i < l; i++) {
      const value = record.get(i)
      if (isNode(value)) {
        const node = value as Neo4jNode
        nodes.set(getId(node.identity), node)
      } else if (isPath(value)) {
        const path = value as Path
        nodes.set(getId(path.start.identity), path.start)
        for (let i = 0; i < path.segments.length; i++) {
          const segment = path.segments[i]
          nodes.set(getId(segment.end.identity), segment.end)
          relations.set(
            getId(segment.relationship.identity),
            segment.relationship
          )
        }
      } else if (isRelationship(value)) {
        const relationship = value as Relationship
        relations.set(getId(relationship.identity), relationship)
        allMissingNodeIds.push(relationship.start)
        allMissingNodeIds.push(relationship.end)
      }
      dataItem[record.keys[i]] = value
    }
    data.push(dataItem)
  })

  for (const id of allMissingNodeIds.filter((id) => !nodes.has(getId(id)))) {
    missingNodeIds.push(id)
  }
}

/**
 * Establishes a connection to a Neo4j database.
 * @param url The URL to connect to, usually through the bolt protocol (bolt://)
 * @param username The username to use.
 * @param password The password to use.
 * @param encrypted Whether to use encryption.
 * @param databaseName The name of the database (since neo4j 4.1)
 */
async function connectToDB({
  url,
  username,
  password,
  databaseName,
}: {
  url: string
  username: string
  password: string
  databaseName?: string
}): Promise<(query: string, params?: Parameters) => Promise<QueryResult>> {
  // create a new Neo4j driver instance
  const neo4jDriver = driver(url, auth.basic(username, password), {})

  async function runCypherQuery(
    query: string,
    params: Parameters = {}
  ): Promise<QueryResult> {
    const session = neo4jDriver.session({
      defaultAccessMode: 'READ',
      database: databaseName,
    })
    try {
      return await session.run(query, params)
    } catch (e) {
      throw new Error(`Could not run cypher query: ${e}`)
    } finally {
      await session.close()
    }
  }

  try {
    // check connection
    await runCypherQuery('MATCH (n) RETURN n LIMIT 1')
  } catch (e) {
    throw new Error(`Could not connect to Neo4j: ${e}`)
  }

  return runCypherQuery
}
