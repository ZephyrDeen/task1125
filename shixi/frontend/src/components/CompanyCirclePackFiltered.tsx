"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";

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

interface HierarchyNode {
  name: string;
  children?: HierarchyNode[];
  value?: number;
  company?: Company;
}

// Build hierarchy from filtered companies: Level -> Country -> Companies
function buildHierarchyFromCompanies(companies: Company[]): HierarchyNode {
  // Group by level, then by country
  const levelGroups: Record<string, Record<string, Company[]>> = {};

  companies.forEach((company) => {
    const levelKey = `Level ${company.level}`;
    if (!levelGroups[levelKey]) {
      levelGroups[levelKey] = {};
    }
    if (!levelGroups[levelKey][company.country]) {
      levelGroups[levelKey][company.country] = [];
    }
    levelGroups[levelKey][company.country].push(company);
  });

  // Build hierarchy
  const root: HierarchyNode = {
    name: "Companies",
    children: Object.entries(levelGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([level, countries]) => ({
        name: level,
        children: Object.entries(countries)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([country, companiesInCountry]) => ({
            name: country,
            children: companiesInCountry
              .sort((a, b) => b.employees - a.employees)
              .map((company) => ({
                name: company.company_name,
                value: company.employees || 1,
                company,
              })),
          })),
      })),
  };

  return root;
}

interface Props {
  companies: Company[];
}

export default function CompanyCirclePackFiltered({ companies }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || companies.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const containerWidth = containerRef.current.clientWidth;
    const width = Math.min(containerWidth, 900);
    const height = 500;

    // Build hierarchy from filtered companies
    const hierarchyData = buildHierarchyFromCompanies(companies);

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
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#000");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", null);
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

    // Create the zoom behavior
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
  }, [companies]);

  if (companies.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
          color: "#637381",
        }}
      >
        No data to display. Adjust filters to see results.
      </Box>
    );
  }

  return (
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
  );
}

