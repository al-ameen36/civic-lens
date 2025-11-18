import { QdrantClient } from "@qdrant/js-client-rest";
import { Report, CreateReportData } from "@/types/report";

// Initialize Qdrant client
const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "reports";

// Check if Qdrant is available
async function isQdrantAvailable(): Promise<boolean> {
  try {
    await client.getCollections();
    return true;
  } catch (error) {
    console.log("Qdrant not available, using fallback mode");
    return false;
  }
}

// Initialize collection if it doesn't exist
export async function initializeCollection() {
  try {
    const available = await isQdrantAvailable();
    if (!available) {
      console.log("Qdrant not available - skipping collection initialization");
      return;
    }

    const collections = await client.getCollections();
    const collectionExists = collections.collections.some(
      (col) => col.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 384, // Using sentence-transformers/all-MiniLM-L6-v2 embeddings
          distance: "Cosine",
        },
      });
      console.log("Collection created successfully");
    }
  } catch (error) {
    console.error("Error initializing collection:", error);
  }
}

// Generate embeddings for text (simplified - in production use proper embedding service)
async function generateEmbedding(text: string): Promise<number[]> {
  // For now, return a mock embedding based on text hash
  // In production, use OpenAI embeddings or sentence-transformers
  const hash = text.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  // Generate normalized vector
  const vector = Array.from(
    { length: 384 },
    (_, i) => Math.sin(hash + i) * 0.1
  );

  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / magnitude);
}

// Insert report into Qdrant
export async function insertReport(report: Report): Promise<void> {
  try {
    const available = await isQdrantAvailable();
    if (!available) {
      console.log("Qdrant not available - report not persisted");
      return;
    }

    const embedding = await generateEmbedding(
      `${report.title} ${report.description}`
    );

    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: parseInt(report.id),
          vector: embedding,
          payload: {
            title: report.title,
            description: report.description,
            category: report.category,
            location: report.location,
            coordinates: report.coordinates,
            upvotes: report.upvotes,
            downvotes: report.downvotes || 0,
            timestamp: report.timestamp.toISOString(),
            imageUrl: report.imageUrl,
            userVotes: {}, // Object to store user votes
          },
        },
      ],
    });
  } catch (error) {
    console.error("Error inserting report:", error);
    throw error;
  }
}

// Get all reports from Qdrant
export async function getAllReports(): Promise<Report[]> {
  try {
    const available = await isQdrantAvailable();
    if (!available) {
      // Return empty array if Qdrant is not available
      return [];
    }

    const result = await client.scroll(COLLECTION_NAME, {
      limit: 1000,
      with_payload: true,
      with_vector: false,
    });

    return result.points.map((point) => ({
      id: point.id.toString(),
      title: point.payload?.title as string,
      description: point.payload?.description as string,
      category: point.payload?.category as any,
      location: point.payload?.location as string,
      coordinates: point.payload?.coordinates as [number, number],
      upvotes: point.payload?.upvotes as number,
      downvotes: (point.payload?.downvotes as number) || 0,
      timestamp: new Date(point.payload?.timestamp as string),
      imageUrl: point.payload?.imageUrl as string,
      userVote: null, // Will be set by API based on user
      userVotes:
        (point.payload?.userVotes as Record<string, "up" | "down">) || {},
    }));
  } catch (error) {
    console.error("Error getting reports:", error);
    return [];
  }
}

// Search reports by text
export async function searchReports(
  query: string,
  limit: number = 20
): Promise<Report[]> {
  try {
    const embedding = await generateEmbedding(query);

    const result = await client.search(COLLECTION_NAME, {
      vector: embedding,
      limit,
      with_payload: true,
      score_threshold: 0.5,
    });

    return result.map((point) => ({
      id: point.id.toString(),
      title: point.payload?.title as string,
      description: point.payload?.description as string,
      category: point.payload?.category as any,
      location: point.payload?.location as string,
      coordinates: point.payload?.coordinates as [number, number],
      upvotes: point.payload?.upvotes as number,
      downvotes: (point.payload?.downvotes as number) || 0,
      timestamp: new Date(point.payload?.timestamp as string),
      imageUrl: point.payload?.imageUrl as string,
      userVote: null, // Will be set by API based on user
      userVotes:
        (point.payload?.userVotes as Record<string, "up" | "down">) || {},
    }));
  } catch (error) {
    console.error("Error searching reports:", error);
    return [];
  }
}

// Get reports within date range
export async function getReportsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Report[]> {
  try {
    const result = await client.scroll(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: "timestamp",
            range: {
              gte: startDate.toISOString(),
              lte: endDate.toISOString(),
            },
          },
        ],
      },
      limit: 1000,
      with_payload: true,
      with_vector: false,
    });

    return result.points.map((point) => ({
      id: point.id.toString(),
      title: point.payload?.title as string,
      description: point.payload?.description as string,
      category: point.payload?.category as any,
      location: point.payload?.location as string,
      coordinates: point.payload?.coordinates as [number, number],
      upvotes: point.payload?.upvotes as number,
      downvotes: (point.payload?.downvotes as number) || 0,
      timestamp: new Date(point.payload?.timestamp as string),
      imageUrl: point.payload?.imageUrl as string,
      userVote: null, // Will be set by API based on user
      userVotes:
        (point.payload?.userVotes as Record<string, "up" | "down">) || {},
    }));
  } catch (error) {
    console.error("Error getting reports by date range:", error);
    return [];
  }
}

// Bulk insert reports (for seeding data)
export async function bulkInsertReports(reports: Report[]): Promise<void> {
  try {
    const available = await isQdrantAvailable();
    if (!available) {
      console.log("Qdrant not available - cannot insert reports");
      throw new Error("Qdrant not available");
    }

    // Process reports in smaller batches to avoid issues
    const batchSize = 5;
    for (let i = 0; i < reports.length; i += batchSize) {
      const batch = reports.slice(i, i + batchSize);

      const points = await Promise.all(
        batch.map(async (report) => {
          const embedding = await generateEmbedding(
            `${report.title} ${report.description}`
          );
          return {
            id: parseInt(report.id),
            vector: embedding,
            payload: {
              title: report.title,
              description: report.description,
              category: report.category,
              location: report.location,
              coordinates: report.coordinates,
              upvotes: report.upvotes,
              downvotes: report.downvotes || 0,
              timestamp: report.timestamp.toISOString(),
              imageUrl: report.imageUrl || "",
              userVotes: {}, // Object to store user votes
            },
          };
        })
      );

      await client.upsert(COLLECTION_NAME, {
        wait: true,
        points: points,
      });

      console.log(
        `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          reports.length / batchSize
        )}`
      );
    }

    console.log(`Successfully inserted ${reports.length} reports`);
  } catch (error) {
    console.error("Error bulk inserting reports:", error);
    throw error;
  }
}
