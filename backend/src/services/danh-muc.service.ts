import { prisma } from '../config/prisma'
import type { DanhMucNode } from '../dtos/catalog.dto'

/** Trả cây danh mục cha-con, chỉ lấy danh mục HOAT_DONG. */
async function tree(): Promise<DanhMucNode[]> {
  const rows = await prisma.danhMuc.findMany({
    where: { trangThai: 'HOAT_DONG' },
    select: {
      danhMucId: true,
      danhMucChaId: true,
      slug: true,
      tenDanhMuc: true,
      moTa: true,
      thuTu: true,
    },
    orderBy: [{ thuTu: 'asc' }, { danhMucId: 'asc' }],
  })

  const nodes = new Map<number, DanhMucNode>()
  for (const row of rows) {
    nodes.set(row.danhMucId, {
      id: row.danhMucId,
      slug: row.slug,
      tenDanhMuc: row.tenDanhMuc,
      moTa: row.moTa,
      thuTu: row.thuTu,
      danhMucChaId: row.danhMucChaId,
      con: [],
    })
  }

  const roots: DanhMucNode[] = []
  for (const node of nodes.values()) {
    const parent = node.danhMucChaId !== null ? nodes.get(node.danhMucChaId) : undefined
    if (parent) parent.con.push(node)
    else roots.push(node)
  }
  return roots
}

export const danhMucService = { tree }
