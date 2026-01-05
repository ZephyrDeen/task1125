"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";

interface Company {
  company_code: string;
  company_name: string;
  level: string;
  country: string;
  city: string;
  founded_year: number;
  annual_revenue: number;
  employees: number;
}

interface Relationship {
  company_code: string;
  parent_company: string;
}

interface HierarchyNode {
  name: string;
  code: string;
  level: number;
  country: string;
  city: string;
  employees: number;
  revenue: number;
  children?: HierarchyNode[];
  value?: number;
}

interface Props {
  companies: Company[];
}

// Cache relationships data
let cachedRelationships: Relationship[] | null = null;

async function fetchRelationships(): Promise<Relationship[]> {
  if (cachedRelationships) return cachedRelationships;

  const response = await fetch("/relationships_1217.csv");
  const csvText = await response.text();

  // Parse CSV
  const lines = csvText.trim().split("\n");
  cachedRelationships = [];

  for (let i = 1; i < lines.length; i++) {
    const [company_code, parent_company] = lines[i].split(",");
    cachedRelationships.push({
      company_code: company_code?.trim() || "",
      parent_company: parent_company?.trim() || "",
    });
  }

  return cachedRelationships;
}

// Build hierarchy from filtered companies
// Shows all children of filtered companies, even if children are not in filter results
function buildHierarchyFromFiltered(
  filteredCompanies: Company[],
  allCompanies: Company[],
  relations: Relationship[]
): HierarchyNode | null {
  if (filteredCompanies.length === 0) return null;

  // Create company map from ALL companies (not just filtered)
  // This allows us to show children that are not in the filter results
  const allCompanyMap = new Map<string, Company>();
  allCompanies.forEach((company) => {
    allCompanyMap.set(company.company_code, company);
  });

  // Create company map from filtered companies
  const filteredCompanyMap = new Map<string, Company>();
  filteredCompanies.forEach((company) => {
    filteredCompanyMap.set(company.company_code, company);
  });

  // Get all company codes that are in filtered data
  const filteredCodes = new Set(filteredCompanies.map((c) => c.company_code));

  // Build ALL parent-child relationships (not just for filtered companies)
  // This allows us to show children of filtered companies even if children are not in filter
  const allChildrenMap = new Map<string, string[]>();
  relations.forEach((rel) => {
    const childCode = rel.company_code;
    const parentCode = rel.parent_company;

    if (parentCode) {
      if (!allChildrenMap.has(parentCode)) {
        allChildrenMap.set(parentCode, []);
      }
      allChildrenMap.get(parentCode)!.push(childCode);
    }
  });

  // Find root nodes (filtered companies that don't have a parent in the filtered set)
  // But we'll show all their children regardless of whether children are in filter
  const hasParentInFilter = new Set<string>();
  filteredCompanies.forEach((company) => {
    relations.forEach((rel) => {
      if (rel.company_code === company.company_code && rel.parent_company) {
        if (filteredCodes.has(rel.parent_company)) {
          hasParentInFilter.add(company.company_code);
        }
      }
    });
  });

  const rootCodes = filteredCompanies
    .filter((c) => !hasParentInFilter.has(c.company_code))
    .map((c) => c.company_code);

  // Build node recursively
  // Shows all children, even if they are not in the filter results
  function buildNode(companyCode: string): HierarchyNode | null {
    // Get company from all companies map (not just filtered)
    const company = allCompanyMap.get(companyCode);
    if (!company) return null;

    // Get all children from relationships (not just filtered children)
    const children = allChildrenMap.get(companyCode) || [];

    if (children.length === 0) {
      return {
        name: company.company_name,
        code: company.company_code,
        level: parseInt(company.level) || 0,
        country: company.country,
        city: company.city,
        value: company.employees || 1,
        employees: company.employees,
        revenue: company.annual_revenue,
      };
    }

    return {
      name: company.company_name,
      code: company.company_code,
      level: parseInt(company.level) || 0,
      country: company.country,
      city: company.city,
      employees: company.employees,
      revenue: company.annual_revenue,
      children: children
        .map((childCode) => buildNode(childCode))
        .filter((node): node is HierarchyNode => node !== null)
        .sort((a, b) => (b.employees || 0) - (a.employees || 0)),
    };
  }

  // If there's only one root, use it directly
  if (rootCodes.length === 1) {
    return buildNode(rootCodes[0]);
  }

  // Multiple roots - create a virtual root
  const rootNodes = rootCodes
    .map((code) => buildNode(code))
    .filter((node): node is HierarchyNode => node !== null)
    .sort((a, b) => (b.employees || 0) - (a.employees || 0));

  if (rootNodes.length === 0) {
    // No hierarchy found, create flat structure
    return {
      name: "Filtered Companies",
      code: "root",
      level: 0,
      country: "",
      city: "",
      employees: 0,
      revenue: 0,
      children: companies.map((c) => ({
        name: c.company_name,
        code: c.company_code,
        level: parseInt(c.level) || 0,
        country: c.country,
        city: c.city,
        value: c.employees || 1,
        employees: c.employees,
        revenue: c.annual_revenue,
      })),
    };
  }

  return {
    name: "Filtered Companies",
    code: "root",
    level: 0,
    country: "",
    city: "",
    employees: 0,
    revenue: 0,
    children: rootNodes,
  };
}

export default function CompanyLevelCirclePack({ companies }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [hierarchyData, setHierarchyData] = useState<HierarchyNode | null>(null);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);

  // Fetch all companies data (needed to show children not in filter results)
  useEffect(() => {
    fetch("/companies.json")
      .then((res) => res.json())
      .then((data) => setAllCompanies(data))
      .catch(console.error);
  }, []);

  // Build hierarchy when companies or allCompanies change
  useEffect(() => {
    async function buildHierarchy() {
      if (allCompanies.length === 0) return; // Wait for all companies to load
      
      setLoading(true);
      try {
        const relations = await fetchRelationships();
        const hierarchy = buildHierarchyFromFiltered(companies, allCompanies, relations);
        setHierarchyData(hierarchy);
      } catch (error) {
        console.error("Failed to build hierarchy:", error);
      } finally {
        setLoading(false);
      }
    }

    buildHierarchy();
  }, [companies, allCompanies]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !hierarchyData) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const containerWidth = containerRef.current.clientWidth;
    const width = Math.min(containerWidth, 900);
    const height = width;

    // Create the color scale
    const color = d3
      .scaleLinear<string>()
      .domain([0, 5])
      .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
      .interpolate(d3.interpolateHcl);

    // Compute the layout
    const pack = (data: HierarchyNode) =>
      d3.pack<HierarchyNode>().size([width, height]).padding(3)(
        d3
          .hierarchy(data)
          .sum((d) => d.value || 0)
          .sort((a, b) => (b.value || 0) - (a.value || 0))
      );

    const root = pack(hierarchyData);

    // Remove existing tooltip if any
    d3.selectAll(".company-tooltip").remove();

    // Create tooltip div
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "company-tooltip")
      .style("position", "absolute")
      .style("padding", "8px 12px")
      .style("background", "rgba(0, 0, 0, 0.85)")
      .style("color", "#fff")
      .style("border-radius", "6px")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000)
      .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.3)")
      .style("white-space", "nowrap");

    // Create the SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)
      .style("max-width", "100%")
      .style("height", "auto")
      .style("display", "block")
      .style("margin", "0 auto")
      .style("background", color(0))
      .style("cursor", "pointer");

    // Track current focus and view
    let focus = root;
    let view: [number, number, number];

    // Append the nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", (d) => (d.children ? color(d.depth) : "white"))
      .attr("pointer-events", (d) => (!d.children ? "none" : null))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
        
        // Show tooltip with company name only
        tooltip
          .html(d.data.name)
          .style("opacity", 1);
      })
      .on("mousemove", function (event) {
        // Position tooltip near mouse cursor
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", null).attr("stroke-width", null);
        tooltip.style("opacity", 0);
      })
      .on("click", (event, d) => {
        if (focus !== d) {
          zoom(event, d);
          event.stopPropagation();
        }
      });

    // Append the text labels
    const label = svg
      .append("g")
      .style("font", "10px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
      .style("display", (d) => (d.parent === root ? "inline" : "none"))
      .text((d) => d.data.name);

    // Create the zoom behavior and zoom immediately to the initial focus node
    svg.on("click", (event) => zoom(event, root));
    zoomTo([focus.x, focus.y, focus.r * 2]);

    function zoomTo(v: [number, number, number]) {
      const k = width / v[2];
      view = v;

      label.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("r", (d) => d.r * k);
    }

    function zoom(event: MouseEvent, d: d3.HierarchyCircularNode<HierarchyNode>) {
      focus = d;

      const transition = svg
        .transition()
        .duration(event.altKey ? 7500 : 750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (t: number) => zoomTo(i(t));
        });

      label
        .filter(function (d) {
          return d.parent === focus || (this as SVGTextElement).style.display === "inline";
        })
        .transition(transition as unknown as d3.Transition<d3.BaseType, unknown, null, undefined>)
        .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
        .on("start", function (d) {
          if (d.parent === focus) (this as SVGTextElement).style.display = "inline";
        })
        .on("end", function (d) {
          if (d.parent !== focus) (this as SVGTextElement).style.display = "none";
        });
    }

    // Cleanup function to remove tooltip when component unmounts or data changes
    return () => {
      d3.selectAll(".company-tooltip").remove();
    };
  }, [hierarchyData]);

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: "#fff",
          boxShadow: "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  if (!hierarchyData || companies.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: "#fff",
          boxShadow: "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <Typography variant="body2" sx={{ color: "#637381" }}>
          No data to display
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          justifyContent: "center",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <svg ref={svgRef}></svg>
      </Box>
    </Paper>
  );
}
