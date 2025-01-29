import axios from 'axios';

const BRANCH = 'master';
const OWNER = 'hintzd'; // Updated to your fork
const REPO = 'cheatsheets';

const apiClient = axios.create({
  baseURL: `https://api.github.com/repos/${OWNER}/${REPO}/git`,
  headers: { Accept: 'application/vnd.github.v3+json' },
});

interface ListResponse {
  sha: string;
  url: string;
  tree: File[];
}

interface File {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  url: string;
}

class Service {
  static async listFiles() {
    try {
      // Step 1: Get latest commit SHA
      const refRes = await apiClient.get(`/refs/heads/${BRANCH}`);
      const commitSha = refRes.data.object.sha;

      // Step 2: Get commit details to extract the tree SHA
      const commitRes = await apiClient.get(`/commits/${commitSha}`);
      const treeSha = commitRes.data.tree.sha;

      // Step 3: Fetch the tree
      const treeRes = await apiClient.get<ListResponse>(
        `/trees/${treeSha}?recursive=1`,
      );
      return treeRes.data.tree;
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
    }
  }

  static async getSheet(slug: string) {
    try {
      const response = await axios.get<string>(
        `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${slug}.md`,
      );
      return response.data;
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
    }
  }

  static urlFor(slug: string) {
    return `https://devhints.io/${slug}`;
  }
}

export default Service;
export type { File };
